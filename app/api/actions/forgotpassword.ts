'use server';

import { sendPasswordResetEmail } from '@/_lib/mail';
import { FormStatePasswordForgot, passwordForgotSchema } from '@/_lib/definitions';
import crypto from 'crypto';
import { userRepository } from '@/_lib/userrepository';
import { verificationTokenRepository } from '@/_lib/verificationtokenrepository';
import z from 'zod';
import { regenerateCsrfToken, validateCsrfToken } from '@/_lib/csrf';
import { hashToken } from '@/_lib/tokenutils';

export async function forgotPassword(
    _: FormStatePasswordForgot,
    formData: FormData
): Promise<FormStatePasswordForgot> {
    const csrfToken = formData.get('csrfToken') as string;
    const isValidCsrf = await validateCsrfToken(csrfToken);

    if (!isValidCsrf) return { error: 'Invalid security token. Please refresh the page and try again.' };

    const validatedFields = passwordForgotSchema.safeParse({ email: formData.get('email') as string });

    if (!validatedFields.success) return { errors: z.flattenError(validatedFields.error).fieldErrors };

    const { email } = validatedFields.data;

    const user = await userRepository.findByEmail(email);

    const genericMessage = {
        message: 'If your email is registered, you will receive a link to reset your password.'
    };

    if (!user) return genericMessage;

    const tokenExisting = await verificationTokenRepository.findByIdentifier(email);

    if (!tokenExisting) {
        const rawToken = crypto.randomBytes(32).toString('hex');
        const expires_at = new Date(Date.now() + 60 * 60 * 1000);

        const resetLink = `${process.env.NEXT_URL}/reset-password?token=${rawToken}`;
        const response = await sendPasswordResetEmail(email, resetLink);

        if (!response.ok) {
            console.error("Error sending verification email:", response.error);
            return { error: 'email-send-error' };
        }

        await verificationTokenRepository.deleteByIdentifier(email);
        await verificationTokenRepository.create({
            identifier: email,
            token: hashToken(rawToken),
            expires_at
        });

        await regenerateCsrfToken();
        return genericMessage;
    }

    await regenerateCsrfToken();

    return genericMessage;
}