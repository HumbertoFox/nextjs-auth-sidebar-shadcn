'use server';

import { getUser } from '@/_lib/dal';
import { FormStateUserUpdate, updateUserSchema } from '@/_lib/definitions';
import { redirect } from 'next/navigation';
import z from 'zod';
import { put, del } from '@vercel/blob';
import crypto from 'crypto';
import { UserRepository } from '@/_lib/userrepository';
import { revalidatePath } from 'next/cache';
import { regenerateCsrfToken, validateCsrfToken } from '@/_lib/csrf';

const MAX_FILE_SIZE = 512 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function updateUser(
    _: FormStateUserUpdate,
    formData: FormData
): Promise<FormStateUserUpdate> {
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

    const sessionUser = await getUser();
    if (!sessionUser || !sessionUser?.id) return redirect('/');

    const emailInUse = await UserRepository.findByEmailActive(email);

    if (emailInUse && emailInUse.id !== sessionUser.id) return { errors: { email: ['This email address is already in use.'] } };

    const dataToUpdate: { name?: string; email?: string, image?: string | null } = {};
    if (sessionUser.name !== name) dataToUpdate.name = name;
    if (sessionUser.email !== email) dataToUpdate.email = email;

    if (file && file.size > 0) {
        if (!ALLOWED_TYPES.includes(file.type)) return { errors: { avatar: ['Only JPEG, PNG, or WebP formats are allowed.'] } };

        if (file.size > MAX_FILE_SIZE) return { errors: { avatar: ['The image cannot exceed 512 KB.'] } };

        try {
            if (sessionUser.avatar) {
                try {
                    await del(sessionUser.avatar);
                } catch (deleteErr) {
                    console.warn('It was not possible to delete the previous image:', deleteErr);
                }
            }

            const uniqueFileName = `${crypto.randomUUID()}-${file.name}`;
            const blob = await put(`avatars/${uniqueFileName}`, file, {
                access: 'public',
            });

            if (blob.url) {
                dataToUpdate.image = blob.url;
            }
        } catch (error) {
            console.error('Error sending image:', error);
            return { errors: { avatar: ['Error sending image. Please try again.'] } };
        }
    }

    if (Object.keys(dataToUpdate).length === 0) return { message: 'No changes made.' };

    await UserRepository.updateByIdUserActive(sessionUser.id, dataToUpdate);

    revalidatePath('/dasboard/settings/profile');

    await regenerateCsrfToken();

    return { success: true };
}