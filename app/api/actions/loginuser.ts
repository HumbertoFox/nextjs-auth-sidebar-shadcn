'use server';

import { FormStateLoginUser, signInSchema } from '@/lib/definitions';
import { compare } from 'bcrypt-ts';
import { createSession } from '@/lib/session';
import z from 'zod';
import { UserRepository } from '@/lib/userRepository';

export async function loginUser(state: FormStateLoginUser, formData: FormData): Promise<FormStateLoginUser> {
    const validatedFields = signInSchema.safeParse({
        email: (formData.get('email') as string)?.toLowerCase().trim(),
        password: formData.get('password') as string,
    });

    if (!validatedFields.success) return { errors: z.flattenError(validatedFields.error).fieldErrors };

    const { email, password } = validatedFields.data;

    try {
        const user = await UserRepository.findByEmailActive(email);

        if (!user) return { warning: 'E-mail ou senha inválidos' };

        const isPasswordValid = await compare(password, user.password);

        if (!isPasswordValid) return { warning: 'E-mail ou senha inválidos' };

        await createSession(user.id, user.role);

        return { message: 'Autenticação bem-sucedida! Redirecionando para o Painel, aguarde...' };
    } catch (error) {
        console.error('Unknown error occurred:', error);
        return { warning: 'Algo deu errado. Tente novamente mais tarde.' };
    };
}