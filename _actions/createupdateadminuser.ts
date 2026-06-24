'use server';

import { del, put } from '@vercel/blob';
import crypto from 'crypto';
import * as bcrypt from 'bcrypt-ts';
import z from 'zod';
import sharp from 'sharp';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { FormStateCreateUpdateAdminUser, getSignUpUpdateSchema } from '@/_lib/definitions';
import { userRepository } from '@/_lib/userrepositorys';
import { verificationTokenRepository } from '@/_lib/verificationtokenrepositorys';
import { getUser } from '@/_lib/dal';
import { regenerateCsrfToken, validateCsrfToken } from '@/_lib/csrf';
import { MAX_DIMENSION, MAX_FILE_SIZE, MIME_TO_EXT, UserRole } from '@/_types';
import { getTransactionClient } from '@/_lib/db';
import { hashToken } from '@/_lib/tokenutils';
import { sendCreatedEmailAccountVerification } from '@/_lib/mail';

export async function createUpdateAdminUser(_: FormStateCreateUpdateAdminUser, formData: FormData): Promise<FormStateCreateUpdateAdminUser> {
    const sessionUser = await getUser();
    if (!sessionUser || sessionUser.role !== 'ADMIN') return { warning: 'You do not have permission to perform this action.' };

    const csrfToken = formData.get('csrfToken') as string;
    const isValidCsrf = await validateCsrfToken(csrfToken);

    if (!isValidCsrf) return { warning: 'Invalid security token. Please refresh the page and try again.' };

    const schema = getSignUpUpdateSchema(formData);

    const validatedFields = schema.safeParse({
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        role: formData.get('role') as string,
        password_confirmation: formData.get('password_confirmation') as string,
    });

    const id = formData.get('id') as string | undefined;
    const file = formData.get('file') as File | null;

    function revalidatePaths(role: string) {
        if (role === 'ADMIN') {
            revalidatePath('/dashboard/admins');
        } else {
            revalidatePath('/dashboard/admins/users');
        }
    }

    function getRedirectPath(role: string) {
        return role === 'ADMIN' ? '/dashboard/admins' : '/dashboard/admins/users';
    }

    if (!validatedFields.success) return { errors: z.flattenError(validatedFields.error).fieldErrors };

    const { name, email, password, role } = validatedFields.data;

    if (file && file.size > 0) {
        if (!(file.type in MIME_TO_EXT)) return { errors: { avatar: ['Only JPEG, PNG, and WebP formats are allowed.'] } };
        if (file.size > MAX_FILE_SIZE) return { errors: { avatar: ['The image size cannot exceed 512 KB.'] } };

        try {
            const buffer = Buffer.from(await file.arrayBuffer());
            const metadata = await sharp(buffer).metadata();
            const { width, height } = metadata;
            if (!width || !height || width > MAX_DIMENSION || height > MAX_DIMENSION) {
                return { errors: { avatar: [`The image dimensions cannot exceed 512x512px. (current: ${width}x${height})`] } };
            }
        } catch {
            return { errors: { avatar: ['Unable to read the image file.'] } };
        }
    }

    const client = await getTransactionClient();
    let resultUser: { id: string; role: UserRole };
    let redirectPath: string;
    const hasAvatarChange = !!(file && file.size > 0);

    try {
        await client.query('BEGIN');

        if (id) {
            const userInDb = await userRepository.findActiveById(id, client);
            if (!userInDb) {
                await client.query('ROLLBACK');
                return { warning: 'Invalid security token. Please refresh the page and try again.' };
            }

            const existingUser = await userRepository.findByEmail(email, client);
            if (existingUser && existingUser.id !== id) {
                await client.query('ROLLBACK');
                return { errors: { email: ['This email address is already in use.'] } };
            }

            const emailChanged = userInDb.email !== email;
            const hashedPassword = password ? await bcrypt.hash(password, 12) : undefined;

            const hasFieldChanges =
                userInDb.name !== name ||
                emailChanged ||
                userInDb.role !== role ||
                !!hashedPassword;

            if (!hasFieldChanges && !hasAvatarChange) {
                await client.query('ROLLBACK');
                return { warning: 'No changes were detected.' };
            }

            let updatedUser = userInDb;

            if (hasFieldChanges) {
                const result = await userRepository.updateByAdminUser(id, {
                    name, email, role, ...(hashedPassword && { password: hashedPassword })
                }, client);

                if (!result) {
                    await client.query('ROLLBACK');
                    return { warning: 'Failed to update the user. Please try again.' };
                }

                updatedUser = result;
            }

            if (emailChanged) {
                await userRepository.updateEmailVerified(id, null, client);

                await verificationTokenRepository.deleteByIdentifier(email, client);

                const rawToken = crypto.randomBytes(32).toString('hex');
                const expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

                await verificationTokenRepository.create({
                    identifier: email,
                    token: hashToken(rawToken),
                    expires_at,
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

            resultUser = { id: updatedUser.id, role: updatedUser.role };
            redirectPath = getRedirectPath(updatedUser.role);
        } else {
            const existingUser = await userRepository.findByEmail(email, client);
            if (existingUser) {
                await client.query('ROLLBACK');
                return { errors: { email: ['This email address is already in use!'] } };
            }

            if (!password) {
                await client.query('ROLLBACK');
                return { errors: { password: ['The password must be at least 8 characters long.'] } };
            }

            const hashedPassword = await bcrypt.hash(password, 12);

            const newUser = await userRepository.create({
                name, email, password: hashedPassword, role
            }, client);

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

            resultUser = { id: newUser.id, role: newUser.role };
            redirectPath = getRedirectPath(newUser.role);
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');

        if (error instanceof Error && error.message === 'EMAIL_SEND_FAILED') {
            return { warning: 'We could not send the verification email. Please try again later.' };
        }

        console.error(error);
        return { warning: 'An unexpected error occurred. Please try again.' };
    } finally {
        client.release();
    }

    if (hasAvatarChange && file) {
        try {
            let previousAvatar: string | null = null;
            if (id) {
                const current = await userRepository.findActiveById(id);
                previousAvatar = current?.avatar ?? null;
            }

            const extension = MIME_TO_EXT[file.type];
            const blob = await put(`avatars/${resultUser.id}-${crypto.randomUUID()}.${extension}`, file, {
                access: 'public',
            });

            await userRepository.updateAvatar(resultUser.id, blob.url);

            if (previousAvatar) {
                try {
                    await del(previousAvatar);
                } catch (deleteErr) {
                    console.warn('Unable to delete the previous avatar:', deleteErr);
                }
            }
        } catch (avatarError) {
            console.error('Failed to upload avatar:', avatarError);
        }
    }

    revalidatePaths(resultUser.role);
    await regenerateCsrfToken();
    redirect(redirectPath);
}