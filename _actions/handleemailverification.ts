'use server';

import { regenerateCsrfToken, validateCsrfToken } from '@/_lib/csrf';
import { FormStateEmailVerification } from '@/_lib/definitions';
import { hashToken } from '@/_lib/tokenutils';
import { userRepository } from '@/_lib/userrepositorys';
import { verificationTokenRepository } from '@/_lib/verificationtokenrepositorys';
import { getTransactionClient } from '@/_lib/db';

export async function handleEmailVerification(_: FormStateEmailVerification | undefined, formData: FormData) {
    const csrfToken = formData.get('csrfToken') as string;
    const isValidCsrf = await validateCsrfToken(csrfToken);

    if (!isValidCsrf) return { error: 'Invalid security token. Please refresh the page and try again.' };

    const email = formData.get('email') as string;
    const rawToken = formData.get('token') as string;

    if (!email || !rawToken) return { error: 'Not authenticated' };

    const client = await getTransactionClient();

    try {
        await client.query('BEGIN');

        const isCheckedUserEmail = await userRepository.findByEmail(email, client);

        if (isCheckedUserEmail?.email_verified) {
            await client.query('ROLLBACK');
            return { error: 'Email already verified!' };
        }

        const hashedToken = hashToken(rawToken);
        const tokenExisting = await verificationTokenRepository.findValidToken(email, hashedToken, client);

        if (!tokenExisting) {
            await client.query('ROLLBACK');
            return { error: 'Invalid or expired token' };
        }

        if (!isCheckedUserEmail) {
            await client.query('ROLLBACK');
            return { error: 'Invalid or expired token' };
        }

        await userRepository.updateEmailVerified(isCheckedUserEmail.id, new Date(), client);
        await verificationTokenRepository.delete(email, hashedToken, client);

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        return { error: 'An unexpected error occurred. Please try again.' };
    } finally {
        client.release();
    }

    await regenerateCsrfToken();

    return { success: 'Success, email verified.' };
}