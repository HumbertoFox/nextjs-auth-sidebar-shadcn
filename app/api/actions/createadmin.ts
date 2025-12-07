'use server';

import { put } from '@vercel/blob';
import { createAdminSchema, FormStateCreateAdmin } from '@/_lib/definitions';
import { createSession } from '@/_lib/session';
import * as bcrypt from 'bcrypt-ts';
import z from 'zod';
import sharp from 'sharp';
import { UserRepository } from '@/_lib/userrepository';

const MAX_FILE_SIZE = 512 * 1024;
const MAX_DIMENSION = 512;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function createAdmin(state: FormStateCreateAdmin, formData: FormData): Promise<FormStateCreateAdmin> {
    const validatedFields = createAdminSchema.safeParse({
        name: formData.get('name') as string,
        email: (formData.get('email') as string)?.toLowerCase().trim(),
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
        const existingUser = await UserRepository.findByEmail(email);
        if (existingUser) return { warning: 'Data already registered.' };

        const adminExists = await UserRepository.findAdmin();
        const role = adminExists ? 'USER' : 'ADMIN';

        const hashedPassword = await bcrypt.hash(password, 12);

        let imageUrl: string | undefined;

        if (file && file.size > 0) {
            if (!ALLOWED_TYPES.includes(file.type)) return { errors: { avatar: ['Only JPEG, PNG, or WebP formats are allowed.'] } };

            if (file.size > MAX_FILE_SIZE) return { errors: { avatar: ['The image cannot exceed 512 KB.'] } };

            try {
                const buffer = Buffer.from(await file.arrayBuffer());
                const metadata = await sharp(buffer).metadata();
                const { width, height } = metadata;
                if (width > MAX_DIMENSION || height > MAX_DIMENSION) return { errors: { avatar: [`The image cannot exceed 512x512px. (current: ${width}x${height})`] } };
            } catch {
                return { errors: { avatar: ['Failed to read the image.'] } };
            }

            const uniqueFileName = `${crypto.randomUUID()}-${file.name}`;
            const blob = await put(`avatars/${uniqueFileName}`, file, {
                access: 'public',
            });

            imageUrl = blob.url;
        }

        const user = await UserRepository.create({
            name,
            email,
            password: hashedPassword,
            role,
            avatar: imageUrl,
        });

        await createSession(user.id, user.role);

        return { message: true };
    } catch (error) {
        console.error(error);
        return { warning: 'Something went wrong. Please try again later.' };
    }
}