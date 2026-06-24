'use server';

import { put, del } from '@vercel/blob';
import crypto from 'crypto';
import z from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getUser } from '@/_lib/dal';
import { FormStateUserUpdate, updateUserSchema } from '@/_lib/definitions';
import { userRepository } from '@/_lib/userrepositorys';
import { verificationTokenRepository } from '@/_lib/verificationtokenrepositorys';
import { regenerateCsrfToken, validateCsrfToken } from '@/_lib/csrf';
import { MAX_FILE_SIZE, MIME_TO_EXT } from '@/_types';
import { getTransactionClient } from '@/_lib/db';
import { hashToken } from '@/_lib/tokenutils';
import { sendCreatedEmailAccountVerification } from '@/_lib/mail';

export async function updateUser(_: FormStateUserUpdate, formData: FormData): Promise<FormStateUserUpdate> {
    const sessionUser = await getUser();
    if (!sessionUser || !sessionUser?.id) return redirect('/login');

    const csrfToken = formData.get('csrfToken') as string;
    const isValidCsrf = await validateCsrfToken(csrfToken);
    if (!isValidCsrf) return { success: false };

    const validatedFields = updateUserSchema.safeParse({
        name: formData.get('name') as string,
        email: formData.get('email') as string,
    });

    const file = formData.get('file') as File | null;

    if (!validatedFields.success) return { errors: z.flattenError(validatedFields.error).fieldErrors };

    const { name, email } = validatedFields.data;

    if (file && file.size > 0) {
        if (!(file.type in MIME_TO_EXT)) return { errors: { avatar: ['Only JPEG, PNG, and WebP formats are allowed.'] } };
        if (file.size > MAX_FILE_SIZE) return { errors: { avatar: ['The image cannot exceed 512 KB.'] } };
    }

    const hasAvatarChange = !!(file && file.size > 0);
    const client = await getTransactionClient();
    let emailChanged = false;

    try {
        await client.query('BEGIN');

        const emailInUse = await userRepository.findByEmailActive(email, client);
        if (emailInUse && emailInUse.id !== sessionUser.id) {
            await client.query('ROLLBACK');
            return { errors: { email: ['This email address is already in use.'] } };
        }

        const dataToUpdate: { name?: string; email?: string } = {};
        if (sessionUser.name !== name) dataToUpdate.name = name;

        emailChanged = sessionUser.email !== email;
        if (emailChanged) dataToUpdate.email = email;

        const hasFieldChanges = Object.keys(dataToUpdate).length > 0;

        if (!hasFieldChanges && !hasAvatarChange) {
            await client.query('ROLLBACK');
            return { message: 'No changes made.' };
        }

        if (hasFieldChanges) {
            await userRepository.updateByIdUserActive(sessionUser.id, dataToUpdate, client);
        }

        if (emailChanged) {
            await userRepository.updateEmailVerified(sessionUser.id, null, client);

            await verificationTokenRepository.deleteByIdentifier(email, client);

            const rawToken = crypto.randomBytes(32).toString('hex');
            const expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

            await verificationTokenRepository.create({
                identifier: email, token: hashToken(rawToken), expires_at
            }, client);

            const encodedEmail = encodeURIComponent(email);
            const verifyLink = `${process.env.NEXT_URL}/verify-email?token=${rawToken}&email=${encodedEmail}`;
            const verifySessionLink = `${process.env.NEXT_URL}/dashboard/settings/verify-email?token=${rawToken}&email=${encodedEmail}`;

            const emailResult = await sendCreatedEmailAccountVerification(email, verifyLink, verifySessionLink);

            if (!emailResult.ok) {
                console.error('Failed to send verification email:', emailResult.error);
                throw new Error('EMAIL_SEND_FAILED');
            }
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');

        if (error instanceof Error && error.message === 'EMAIL_SEND_FAILED') {
            return { errors: { email: ['We could not send the verification email. Please try again later.'] } };
        }

        console.error(error);
        return { message: 'An unexpected error occurred. Please try again.' };
    } finally {
        client.release();
    }

    if (hasAvatarChange && file) {
        try {
            const extension = MIME_TO_EXT[file.type];
            const blob = await put(`avatars/${sessionUser.id}-${crypto.randomUUID()}.${extension}`, file, {
                access: 'public',
            });

            await userRepository.updateAvatar(sessionUser.id, blob.url);

            if (sessionUser.avatar) {
                try {
                    await del(sessionUser.avatar);
                } catch (deleteErr) {
                    console.warn('It was not possible to delete the previous avatar:', deleteErr);
                }
            }
        } catch (avatarError) {
            console.error('Error sending image:', avatarError);
            return { errors: { avatar: ['Error sending image. Please try again.'] } };
        }
    }

    revalidatePath('/dashboard/settings/profile');
    await regenerateCsrfToken();

    return { success: true, ts: Date.now() };
}