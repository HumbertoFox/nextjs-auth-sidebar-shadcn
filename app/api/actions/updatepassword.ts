'use server';

import { getUser } from '@/_lib/dal';
import { FormStatePasswordUpdate, passwordUpdateSchema } from '@/_lib/definitions';
import { compare, hash } from 'bcrypt-ts';
import { redirect } from 'next/navigation';
import z from 'zod';
import { UserRepository } from '@/_lib/userrepository';
import { revalidatePath } from 'next/cache';

export async function updatePassword(state: FormStatePasswordUpdate, formData: FormData): Promise<FormStatePasswordUpdate> {
    const validatedFields = passwordUpdateSchema.safeParse({
        current_password: formData.get('current_password') as string,
        password: formData.get('password') as string,
        password_confirmation: formData.get('password_confirmation') as string
    });

    if (!validatedFields.success) return { errors: z.flattenError(validatedFields.error).fieldErrors };

    const { current_password, password } = validatedFields.data;

    const sessionUser = await getUser();

    if (!sessionUser?.id) return redirect('/');

    const authUser = await UserRepository.findActiveById(sessionUser.id);

    if (!authUser) return redirect('/');

    const isValid = await compare(current_password, authUser.password);

    if (!isValid) return { errors: { current_password: ['A senha atual está incorreta'] } };

    if (current_password === password) return { errors: { password: ['A nova senha não pode ser igual à antiga'] } };

    const hashedPassword = await hash(password, 12);

    await UserRepository.updatePassword(sessionUser.id, hashedPassword);
    
    revalidatePath('/dashboard/settings/password');

    return { message: true };
}