'use server';

import { FormStatePasswordReset, passwordResetSchema } from '@/_lib/definitions';
import { UserRepository } from '@/_lib/userrepository';
import { VerificationTokenRepository } from '@/_lib/verificationtokenrepository';
import { hash } from 'bcrypt-ts';
import z from 'zod';

export async function resetPassword(state: FormStatePasswordReset, formData: FormData): Promise<FormStatePasswordReset> {
    const validatedFields = passwordResetSchema.safeParse({
        email: formData.get('email') as string,
        token: formData.get('token') as string,
        password: formData.get('password') as string,
        password_confirmation: formData.get('password_confirmation') as string
    });

    if (!validatedFields.success) return { errors: z.flattenError(validatedFields.error).fieldErrors };

    const { email, token, password } = validatedFields.data;

    const tokenExisting = await VerificationTokenRepository.findValidToken(email, token);

    if (!tokenExisting || tokenExisting.expires < new Date()) return { warning: 'Invalid or expired token.' };

    const hashedPassword = await hash(password, 12);

    await UserRepository.updatePasswordByEmail(email, hashedPassword);

    await VerificationTokenRepository.delete(email, token);

    return { message: 'Password reset successfully!' };
}