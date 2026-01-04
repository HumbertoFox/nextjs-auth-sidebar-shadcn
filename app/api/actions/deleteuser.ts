'use server';

import { getUser } from '@/_lib/dal';
import { deleteUserSchema, FormStateUserDelete } from '@/_lib/definitions';
import * as bcrypt from 'bcrypt-ts';
import z from 'zod';
import { UserRepository } from '@/_lib/userrepository';

export async function deleteUser(state: FormStateUserDelete, formData: FormData): Promise<FormStateUserDelete> {
    const validatedFields = deleteUserSchema.safeParse({ password: formData.get('password') as string });

    if (!validatedFields.success) return { errors: z.flattenError(validatedFields.error).fieldErrors };

    const { password } = validatedFields.data;

    const sessionUser = await getUser();
    if (!sessionUser || !sessionUser?.id) return { message: false };

    const existingUser = await UserRepository.findActiveById(sessionUser.id);

    if (!existingUser) return { message: false };

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);

    if (!isPasswordCorrect) return { errors: { password: ['Incorrect password'] } };

    await UserRepository.softDeleteById(sessionUser.id);

    return { message: true };
}