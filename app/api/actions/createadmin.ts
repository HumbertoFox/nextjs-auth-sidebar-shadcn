'use server';

import { put } from '@vercel/blob';
import { createAdminSchema, FormStateCreateAdmin } from '@/_lib/definitions';
import { createSession } from '@/_lib/session';
import * as bcrypt from 'bcrypt-ts';
import z from 'zod';
import sharp from 'sharp';
import { userRepository } from '@/_lib/userrepository.ts';
import { regenerateCsrfToken, validateCsrfToken } from '@/_lib/csrf';

const MAX_FILE_SIZE = 512 * 1024;
const MAX_DIMENSION = 512;
const MIME_TO_EXT: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
};

export async function createAdmin(
    _: FormStateCreateAdmin,
    formData: FormData
): Promise<FormStateCreateAdmin> {
    const csrfToken = formData.get('csrfToken') as string;
    const isValidCsrf = await validateCsrfToken(csrfToken);

    if (!isValidCsrf) return { warning: 'Invalid security token. Please refresh the page and try again.' };

    const validatedFields = createAdminSchema.safeParse({
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        password_confirmation: formData.get('password_confirmation') as string
    });

    const file = formData.get('file') as File | null;

    if (!validatedFields.success) return { errors: z.flattenError(validatedFields.error).fieldErrors };

    const {
        name,
        email,
        password
    } = validatedFields.data;

    try {
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) return { warning: 'Data already registered.' };

        const adminExists = await userRepository.adminExists();
        const role = adminExists ? 'USER' : 'ADMIN';

        const hashedPassword = await bcrypt.hash(password, 12);

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

        const user = await userRepository.create({
            name,
            email,
            password: hashedPassword,
            role,
        });

        if (file && file.size > 0) {
            const extension = MIME_TO_EXT[file.type];
            const blob = await put(`avatars/${user.id}-${crypto.randomUUID()}.${extension}`, file, {
                access: 'public',
            });

            await userRepository.updateAvatar(user.id, blob.url);
        }

        await createSession(user.id, user.role);
        await regenerateCsrfToken();

        return {
            message: true,
            info: 'Account created successfully! Redirecting to the Dashboard, please wait...'
        };
    } catch (error) {
        console.error(error);
        return { warning: 'Something went wrong. Please try again later.' };
    }
}