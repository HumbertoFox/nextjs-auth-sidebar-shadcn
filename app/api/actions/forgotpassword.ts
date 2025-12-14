'use server';

import { sendPasswordResetEmail } from '@/_lib/mail';
import { FormStatePasswordForgot, passwordForgotSchema } from '@/_lib/definitions';
import crypto from 'crypto';
import { UserRepository } from '@/_lib/userrepository';
import { VerificationTokenRepository } from '@/_lib/verificationtokenrepository';
import z from 'zod';

export async function forgotPassword(state: FormStatePasswordForgot, formData: FormData): Promise<FormStatePasswordForgot> {
    const validatedFields = passwordForgotSchema.safeParse({ email: formData.get('email') as string });

    if (!validatedFields.success) return { errors: z.flattenError(validatedFields.error).fieldErrors };

    const { email } = validatedFields.data;

    const user = await UserRepository.findByEmail(email);

    if (!user) return { message: 'If your email is registered, you will receive a link to reset your password.' };

    const tokenExisting = await VerificationTokenRepository.findByIdentifier(email);

    if (!tokenExisting || new Date() > tokenExisting.expires) {
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 60 * 60 * 1000);

        const resetLink = `${process.env.NEXT_URL}/reset-password?token=${token}&email=${email}`;
        const response = await sendPasswordResetEmail(email, resetLink);

        if (!response.ok) {
            console.error("Error sending verification email:", response.error);
            return { error: 'email-send-error' };
        }

        await VerificationTokenRepository.create({ identifier: email, token, expires });

        return { message: 'If your email is registered, you will receive a link to reset your password.' };
    }

    return { message: 'If your email is registered, you will receive a link to reset your password.' };
}