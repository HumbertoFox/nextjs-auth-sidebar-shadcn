'use server';

import { put } from '@vercel/blob';
import { FormStateCreateUpdateAdminUser, getSignUpUpdateSchema } from '@/_lib/definitions';
import * as bcrypt from 'bcrypt-ts';
import z from 'zod';
import sharp from 'sharp';
import { revalidatePath } from 'next/cache';
import { UserRepository } from '@/_lib/userrepository';
import { getUser } from '@/_lib/dal';

const MAX_FILE_SIZE = 512 * 1024;
const MAX_DIMENSION = 512;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function createUpdateAdminUser(state: FormStateCreateUpdateAdminUser, formData: FormData): Promise<FormStateCreateUpdateAdminUser> {
    const schema = getSignUpUpdateSchema(formData);

    const validatedFields = schema.safeParse({
        name: formData.get('name') as string,
        email: (formData.get('email') as string)?.toLowerCase().trim(),
        password: formData.get('password') as string,
        role: formData.get('role') as string,
        password_confirmation: formData.get('password_confirmation') as string
    });

    const id = formData.get('id') as string | undefined;
    const file = formData.get('file') as File | null;

    function revalidatePaths(role: string) {
        if (role === 'ADMIN') {
            revalidatePath('/dashboard/admins')
        } else {
            revalidatePath('/dashboard/admins/users');
        }
    };

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

        if (id) {
            const userInDb = await UserRepository.findActiveById(id);

            if (!userInDb || userInDb.deletedAt) return { message: false };

            const existingUser = await UserRepository.findByEmail(email);

            if (existingUser && existingUser.id !== id) return { errors: { email: ['This email address is already in use!'] } };

            const hasChanges =
                userInDb.name !== name ||
                userInDb.email !== email ||
                userInDb.role !== role ||
                (hashedPassword && userInDb.password !== hashedPassword);

            if (!hasChanges) return { message: false };

            const updateUser = await UserRepository.updateByAdminUser(id, {
                name,
                email,
                role,
                ...(hashedPassword && { password: hashedPassword }),
                ...(imageUrl && { image: imageUrl }),
            });

            if (!updateUser) return { message: false };
            revalidatePaths(updateUser.role);

            return { message: true };
        } else {
            const existingUser = await UserRepository.findByEmail(email);

            if (existingUser) return { errors: { email: ['This email address is already in use!'] } };

            const newUser = await UserRepository.create({
                name,
                email,
                password: hashedPassword!,
                role,
                avatar: imageUrl ?? null,
            });

            revalidatePaths(newUser.role);

            return { message: true };
        }
    } catch (error) {
        console.error(error);
        return { message: false };
    }
}