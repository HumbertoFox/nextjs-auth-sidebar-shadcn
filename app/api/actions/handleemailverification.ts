'use server';

import { sendEmailVerification } from '@/_lib/mail';
import { UserRepository } from '@/_lib/userrepository';
import { VerificationTokenRepository } from '@/_lib/verificationtokenrepository';
import crypto from 'crypto';

type FormStateEmailVerification = {
    error?: string;
    status?: string;
    success?: string;
}

export async function handleEmailVerification(state: FormStateEmailVerification | undefined, formData: FormData) {
    const email = formData.get('email') as string;
    const token = formData.get('token') as string;

    if (!email && !token) return { error: 'Not authenticated' };

    const isCheckedUserEmail = await UserRepository.findByEmail(email);

    if (isCheckedUserEmail?.emailVerified) return { error: 'Email already verified!' };

    const tokenExisting = await VerificationTokenRepository.findByIdentifier(email);

    if (tokenExisting && new Date() > tokenExisting.expires) {
        await VerificationTokenRepository.delete(email, tokenExisting.token);

        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const verifyLink = `${process.env.NEXT_URL}/verify-email?token=${token}&email=${email}`;
        const response = await sendEmailVerification(email, verifyLink);

        if (!response.ok) {
            console.error("Error sending verification email:", response.error);
            return { error: 'email-send-error' };
        }

        await VerificationTokenRepository.create({ identifier: email, token, expires });

        return { status: 'verification-link-sent' };
    }

    await UserRepository.updateEmailVerified(isCheckedUserEmail.id, new Date());

    await VerificationTokenRepository.delete(email, token);

    return { success: 'Success, email verified.' };
}