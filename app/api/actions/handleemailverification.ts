'use server';

import { regenerateCsrfToken, validateCsrfToken } from '@/_lib/csrf';
import { FormStateEmailVerification } from '@/_lib/definitions';
import { sendEmailVerification } from '@/_lib/mail';
import { UserRepository } from '@/_lib/userrepository';
import { VerificationTokenRepository } from '@/_lib/verificationtokenrepository';
import crypto from 'crypto';

export async function handleEmailVerification(
    _: FormStateEmailVerification | undefined,
    formData: FormData
) {
    const csrfToken = formData.get('csrfToken') as string;
    const isValidCsrf = await validateCsrfToken(csrfToken);

    if (!isValidCsrf) return { error: 'Invalid security token. Please refresh the page and try again.' };

    const email = formData.get('email') as string;
    const token = formData.get('token') as string;

    if (!email && !token) return { error: 'Not authenticated' };

    const isCheckedUserEmail = await UserRepository.findByEmail(email);

    if (isCheckedUserEmail?.emailVerified) return { error: 'Email already verified!' };

    const tokenExisting = await VerificationTokenRepository.findValidToken(email, token);

    if (!tokenExisting) return { error: 'Invalid or expired token' };

    if (tokenExisting && new Date() > tokenExisting.expires_at) {
        await VerificationTokenRepository.delete(email, tokenExisting.token);

        const token = crypto.randomBytes(32).toString('hex');
        const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const verifyLink = `${process.env.NEXT_URL}/verify-email?token=${token}&email=${email}`;
        const response = await sendEmailVerification(email, verifyLink);

        if (!response.ok) {
            console.error("Error sending verification email:", response.error);
            return { error: 'email-send-error' };
        }

        await VerificationTokenRepository.create({
            identifier: email,
            token,
            expires_at
        });

        return { status: 'verification-link-sent' };
    }

    await UserRepository.updateEmailVerified(isCheckedUserEmail.id, new Date());

    await VerificationTokenRepository.delete(email, token);

    await regenerateCsrfToken();

    return { success: 'Success, email verified.' };
}