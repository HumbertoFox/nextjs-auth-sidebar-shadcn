'use server';

import { getUser } from '@/lib/dal';
import { deleteUserSchema, FormStateUserDelete } from '@/lib/definitions';
import * as bcrypt from 'bcrypt-ts';
import z from 'zod';
import { UserRepository } from '@/lib/userRepository';

export async function deleteUser(state: FormStateUserDelete, formData: FormData): Promise<FormStateUserDelete> {
    const validatedFields = deleteUserSchema.safeParse({ password: formData.get('password') as string });

    if (!validatedFields.success) return { errors: z.flattenError(validatedFields.error).fieldErrors };

    const { password } = validatedFields.data;

    const sessionUser = await getUser();

    if (!sessionUser?.id) return { message: false };

    const existingUser = await UserRepository.findActiveById(sessionUser.id);

    if (!existingUser) return { message: false };

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);

    if (!isPasswordCorrect) return { errors: { password: ['Senha incorreta'] } };

    await UserRepository.softDeleteById(sessionUser.id);

    return { message: true };
}