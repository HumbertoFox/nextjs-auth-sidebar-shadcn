'use server';

import { sendPasswordResetEmail } from '@/_lib/mail';
import { FormStatePasswordForgot, passwordForgotSchema } from '@/_lib/definitions';
import crypto from 'crypto';
import { userRepository } from '@/_lib/userrepositorys';
import { verificationTokenRepository } from '@/_lib/verificationtokenrepositorys';
import z from 'zod';
import { regenerateCsrfToken, validateCsrfToken } from '@/_lib/csrf';
import { hashToken } from '@/_lib/tokenutils';
import { checkForgotPasswordRateLimit } from '@/_lib/ratelimit';
import { getTransactionClient } from '@/_lib/db';

export async function forgotPassword(_: FormStatePasswordForgot, formData: FormData): Promise<FormStatePasswordForgot> {
    const csrfToken = formData.get('csrfToken') as string;
    const isValidCsrf = await validateCsrfToken(csrfToken);
    if (!isValidCsrf) return { error: 'Invalid security token. Please refresh the page and try again.' };

    const validatedFields = passwordForgotSchema.safeParse({ email: formData.get('email') as string });

    if (!validatedFields.success) return { errors: z.flattenError(validatedFields.error).fieldErrors };

    const { email } = validatedFields.data;

    const rateLimit = await checkForgotPasswordRateLimit(email);
    if (!rateLimit.allowed) {
        const secs = rateLimit.retryAfterSeconds;
        const timeLabel = secs < 60 ? `${secs} second${secs !== 1 ? 's' : ''}` : `${Math.ceil(secs / 60)} minute${Math.ceil(secs / 60) !== 1 ? 's' : ''}`;
        return { error: `Too many attempts. Please try again in ${timeLabel}.` };
    }

    const genericMessage = {
        message: 'If your email is registered, you will receive a link to reset your password.'
    };

    const client = await getTransactionClient();

    try {
        await client.query('BEGIN');

        const user = await userRepository.findByEmail(email, client);

        if (!user) {
            await client.query('ROLLBACK');
            return genericMessage;
        }

        const tokenExisting = await verificationTokenRepository.findByIdentifier(email, client);

        // Já existe um token válido (não expirado) — fica silencioso por design.
        if (tokenExisting) {
            await client.query('ROLLBACK');
            return genericMessage;
        }

        const rawToken = crypto.randomBytes(32).toString('hex');
        const expires_at = new Date(Date.now() + 60 * 60 * 1000).toISOString();

        // Persiste o token ANTES de enviar o email — evita link morto
        // se a conexão cair entre o envio do email e o insert no banco.
        await verificationTokenRepository.deleteByIdentifier(email, client);
        await verificationTokenRepository.create({
            identifier: email, token: hashToken(rawToken), expires_at
        }, client);

        const resetLink = `${process.env.NEXT_URL}/reset-password?token=${rawToken}`;
        const response = await sendPasswordResetEmail(email, resetLink);

        if (!response.ok) {
            console.error('Error sending password reset email:', response.error);
            throw new Error('EMAIL_SEND_FAILED');
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');

        if (!(error instanceof Error && error.message === 'EMAIL_SEND_FAILED')) console.error(error);

        // Mesmo em falha, devolve a mensagem genérica — não vaza
        // se o email existe nem se o SMTP funcionou ou não.
        return genericMessage;
    } finally {
        client.release();
    }

    await regenerateCsrfToken();
    return genericMessage;
}