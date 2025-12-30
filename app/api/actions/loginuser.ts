'use server';

import { FormStateLoginUser, signInSchema } from '@/_lib/definitions';
import { compare } from 'bcrypt-ts';
import { createSession } from '@/_lib/session';
import z from 'zod';
import { UserRepository } from '@/_lib/userrepository';

export async function loginUser(state: FormStateLoginUser, formData: FormData): Promise<FormStateLoginUser> {
    const validatedFields = signInSchema.safeParse({
        email: (formData.get('email') as string),
        password: formData.get('password') as string,
    });

    if (!validatedFields.success) return { errors: z.flattenError(validatedFields.error).fieldErrors };

    const { email, password } = validatedFields.data;

    try {
        const user = await UserRepository.findByEmailActive(email);

        if (!user) return { warning: 'Invalid email or password' };

        const isPasswordValid = await compare(password, user.password);

        if (!isPasswordValid) return { warning: 'Invalid email or password' };

        await createSession(user.id, user.role);

        return { message: 'Authentication successful! Redirecting to the Dashboard, please wait...' };
    } catch (error) {
        console.error('Unknown error occurred:', error);
        return { warning: 'Something went wrong. Please try again later.' };
    };
}