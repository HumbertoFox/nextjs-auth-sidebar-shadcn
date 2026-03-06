'use server';

import { getUser } from '@/_lib/dal';
import { deleteUserSchema, FormStateUserDelete } from '@/_lib/definitions';
import * as bcrypt from 'bcrypt-ts';
import z from 'zod';
import { UserRepository } from '@/_lib/userrepository';
import { regenerateCsrfToken, validateCsrfToken } from '@/_lib/csrf';

export async function deleteUser(
    _: FormStateUserDelete,
    formData: FormData
): Promise<FormStateUserDelete> {
    const csrfToken = formData.get('csrfToken') as string;
    const isValidCsrf = await validateCsrfToken(csrfToken);

    if (!isValidCsrf) return { message: false };

    const validatedFields = deleteUserSchema.safeParse({ password: formData.get('password') as string });

    if (!validatedFields.success) return { errors: z.flattenError(validatedFields.error).fieldErrors };

    const { password } = validatedFields.data;

    const sessionUser = await getUser();
    if (!sessionUser || !sessionUser?.id) return { message: false };

    const existingUser = await UserRepository.findActiveById(sessionUser.id);

    if (!existingUser) return { message: false };

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);

    if (!isPasswordCorrect) return { errors: { password: ['Incorrect password'] } };

    const activeAdmins = await UserRepository.countActiveAdmins();

    if (activeAdmins <= 1) return { errors: { password: [`It's not possible to delete an ADMIN account when there's only one active account!`] } };

    await UserRepository.softDeleteById(sessionUser.id);

    await regenerateCsrfToken();

    return { message: true };
}