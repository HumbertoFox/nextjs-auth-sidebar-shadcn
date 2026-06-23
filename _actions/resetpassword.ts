'use server';

import { regenerateCsrfToken, validateCsrfToken } from '@/_lib/csrf';
import { FormStatePasswordReset, passwordResetSchema } from '@/_lib/definitions';
import { hashToken } from '@/_lib/tokenutils';
import { userRepository } from '@/_lib/userrepositorys';
import { verificationTokenRepository } from '@/_lib/verificationtokenrepositorys';
import { hash } from 'bcrypt-ts';
import { getTransactionClient } from '@/_lib/db';
import z from 'zod';

export async function resetPassword(_: FormStatePasswordReset, formData: FormData): Promise<FormStatePasswordReset> {
    const csrfToken = formData.get('csrfToken') as string;
    const isValidCsrf = await validateCsrfToken(csrfToken);
    if (!isValidCsrf) return { warning: 'Invalid security token. Please refresh the page and try again.' };

    const validatedFields = passwordResetSchema.safeParse({
        token: formData.get('token') as string,
        password: formData.get('password') as string,
        password_confirmation: formData.get('password_confirmation') as string
    });

    if (!validatedFields.success) return { errors: z.flattenError(validatedFields.error).fieldErrors };

    const { token, password } = validatedFields.data;
    const hashedToken = hashToken(token);

    const client = await getTransactionClient();

    try {
        await client.query('BEGIN');

        // FOR UPDATE trava a linha até o fim da transação — impede que uma
        // segunda requisição concorrente reutilize o mesmo token.
        const tokenRecord = await verificationTokenRepository.findValidTokenOnlyForUpdate(hashedToken, client);

        if (!tokenRecord) {
            await client.query('ROLLBACK');
            return { warning: 'Invalid or expired token.' };
        }

        const email = tokenRecord.identifier;
        const hashedPassword = await hash(password, 12);

        await userRepository.updatePasswordByEmail(email, hashedPassword, client);
        await verificationTokenRepository.delete(email, hashedToken, client);

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        return { warning: 'Something went wrong. Please try again later.' };
    } finally {
        client.release();
    }

    await regenerateCsrfToken();

    return { message: 'Password reset successfully!' };
}