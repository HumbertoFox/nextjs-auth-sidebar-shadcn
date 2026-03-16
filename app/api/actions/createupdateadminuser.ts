'use server';

import { del, put } from '@vercel/blob';
import { FormStateCreateUpdateAdminUser, getSignUpUpdateSchema } from '@/_lib/definitions';
import * as bcrypt from 'bcrypt-ts';
import z from 'zod';
import sharp from 'sharp';
import { revalidatePath } from 'next/cache';
import { userRepository } from '@/_lib/userrepositorys';
import { getUser } from '@/_lib/dal';
import { regenerateCsrfToken, validateCsrfToken } from '@/_lib/csrf';

const MAX_FILE_SIZE = 512 * 1024;
const MAX_DIMENSION = 512;
const MIME_TO_EXT: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
};

export async function createUpdateAdminUser(
    _: FormStateCreateUpdateAdminUser,
    formData: FormData
): Promise<FormStateCreateUpdateAdminUser> {
    const csrfToken = formData.get('csrfToken') as string;
    const isValidCsrf = await validateCsrfToken(csrfToken);

    if (!isValidCsrf) return { message: false };

    const schema = getSignUpUpdateSchema(formData);

    const validatedFields = schema.safeParse({
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        role: formData.get('role') as string,
        password_confirmation: formData.get('password_confirmation') as string
    });

    const id = formData.get('id') as string | undefined;
    const file = formData.get('file') as File | null;

    function revalidatePaths(role: string) {
        if (role === 'ADMIN') {
            revalidatePath('/dashboard/admins');
        } else {
            revalidatePath('/dashboard/admins/users');
        };
    }

    if (!validatedFields.success) return { errors: z.flattenError(validatedFields.error).fieldErrors };

    const {
        name,
        email,
        password,
        role
    } = validatedFields.data;

    const sessionUser = await getUser();
    if (!sessionUser || sessionUser.role !== 'ADMIN') return;

    try {
        const hashedPassword = password ? await bcrypt.hash(password, 12) : undefined;

        if (file && file.size > 0) {
            if (!(file.type in MIME_TO_EXT)) return { errors: { avatar: ['Only JPEG, PNG, or WebP formats are allowed.'] } };
            if (file.size > MAX_FILE_SIZE) return { errors: { avatar: ['The image cannot exceed 512 KB.'] } };

            try {
                const buffer = Buffer.from(await file.arrayBuffer());
                const metadata = await sharp(buffer).metadata();
                const { width, height } = metadata;
                if (width > MAX_DIMENSION || height > MAX_DIMENSION) return { errors: { avatar: [`The image cannot exceed 512x512px. (current: ${width}x${height})`] } };
            } catch {
                return { errors: { avatar: ['Failed to read the image.'] } };
            }
        }

        async function uploadAvatar(userId: string, currentAvatar?: string | null): Promise<string> {
            if (currentAvatar) {
                try {
                    await del(currentAvatar);
                } catch (deleteErr) {
                    console.warn('It was not possible to delete the previous avatar:', deleteErr);
                }
            }
            const extension = MIME_TO_EXT[file!.type];
            const blob = await put(`avatars/${userId}-${crypto.randomUUID()}.${extension}`, file!, { access: 'public' });
            return blob.url;
        }

        if (id) {
            const userInDb = await userRepository.findActiveById(id);
            if (!userInDb || userInDb.deleted_at) return { message: false };

            const existingUser = await userRepository.findByEmail(email);
            if (existingUser && existingUser.id !== id) return { errors: { email: ['This email address is already in use!'] } };

            const imageUrl = file && file.size > 0 ? await uploadAvatar(id, userInDb.avatar) : undefined;

            const hasChanges =
                userInDb.name !== name ||
                userInDb.email !== email ||
                userInDb.role !== role ||
                (hashedPassword && userInDb.password !== hashedPassword) ||
                imageUrl !== undefined;

            if (!hasChanges) return { message: false };

            const updateUser = await userRepository.updateByAdminUser(id, {
                name,
                email,
                role,
                ...(hashedPassword && { password: hashedPassword }),
                ...(imageUrl && { avatar: imageUrl }),
            });

            if (!updateUser) return { message: false };
            revalidatePaths(updateUser.role);
        } else {
            const existingUser = await userRepository.findByEmail(email);
            if (existingUser) return { errors: { email: ['This email address is already in use!'] } };

            if (!hashedPassword) return { errors: { password: ['The password must be at least 8 characters long.'] } };

            const newUser = await userRepository.create({
                name,
                email,
                password: hashedPassword,
                role,
            });

            if (file && file.size > 0) {
                const imageUrl = await uploadAvatar(newUser.id);
                await userRepository.updateAvatar(newUser.id, imageUrl);
            }

            revalidatePaths(newUser.role);
        }

        await regenerateCsrfToken();
        return { message: true };
    } catch (error) {
        console.error(error);
        return { message: false };
    }
}