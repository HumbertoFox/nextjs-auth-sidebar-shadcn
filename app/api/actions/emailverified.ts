'use server';

import { getUser } from '@/_lib/dal';
import { sendEmailVerification } from '@/_lib/mail';
import crypto from 'crypto';
import { VerificationTokenRepository } from '@/_lib/verificationtokenrepository';
import { UserRepository } from '@/_lib/userrepository';

export async function emailVerifiedChecked() {
    const sessionUser = await getUser();;

    if (!sessionUser?.email) return null;

    const email = sessionUser.email;

    const tokenExisting = await VerificationTokenRepository.findByIdentifier(email);

    const user = await UserRepository.findByEmail(email);

    if (user?.emailVerified) return null;

    if (tokenExisting && new Date() > tokenExisting.expires) return 'verification-link-sent';

    if (!tokenExisting) {
        const token = crypto.randomBytes(32).toString('hex');

        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await VerificationTokenRepository.create({
            identifier: email,
            token,
            expires
        });

        const verifyLink = `${process.env.NEXT_URL}/auth/verify-email?token=${token}&email=${email}`;
        await sendEmailVerification(email, verifyLink);

        return 'verification-link-sent';
    }

    return 'verification-link-sent';
}