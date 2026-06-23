'use server';

import { getUser } from '@/_lib/dal';
import { FormStatePasswordUpdate, passwordUpdateSchema } from '@/_lib/definitions';
import { compare, hash } from 'bcrypt-ts';
import { redirect } from 'next/navigation';
import z from 'zod';
import { userRepository } from '@/_lib/userrepositorys';
import { revalidatePath } from 'next/cache';
import { regenerateCsrfToken, validateCsrfToken } from '@/_lib/csrf';
import { createSession } from '@/_lib/session';
import { getTransactionClient } from '@/_lib/db';
import { UserRole } from '@/_types';

export async function updatePassword(_: FormStatePasswordUpdate, formData: FormData): Promise<FormStatePasswordUpdate> {
    const sessionUser = await getUser();
    if (!sessionUser || !sessionUser?.id) return redirect('/login');

    const csrfToken = formData.get('csrfToken') as string;
    const isValidCsrf = await validateCsrfToken(csrfToken);
    if (!isValidCsrf) return { message: false };

    const validatedFields = passwordUpdateSchema.safeParse({
        current_password: formData.get('current_password') as string,
        password: formData.get('password') as string,
        password_confirmation: formData.get('password_confirmation') as string
    });

    if (!validatedFields.success) return { errors: z.flattenError(validatedFields.error).fieldErrors };

    const { current_password, password } = validatedFields.data;

    const client = await getTransactionClient();
    let userRole: UserRole;

    try {
        await client.query('BEGIN');

        const authUser = await userRepository.findActiveById(sessionUser.id, client);

        if (!authUser) {
            await client.query('ROLLBACK');
            return redirect('/login');
        }

        // password sempre definida neste fluxo (sem contas OAuth/SSO aqui).
        const isValid = await compare(current_password, authUser.password!);

        if (!isValid) {
            await client.query('ROLLBACK');
            return { errors: { current_password: ['The current password is incorrect.'] } };
        }

        if (current_password === password) {
            await client.query('ROLLBACK');
            return { errors: { password: ['The new password cannot be the same as the old one.'] } };
        }

        const hashedPassword = await hash(password, 12);

        await userRepository.updatePassword(sessionUser.id, hashedPassword, client);

        userRole = authUser.role;

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        return { errors: { current_password: ['Something went wrong. Please try again later.'] } };
    } finally {
        client.release();
    }

    // A partir daqui, a senha já foi trocada com sucesso no banco.
    // Reemitir a sessão é best-effort: se falhar, o usuário ainda recebe
    // a confirmação de sucesso, apenas perde a sessão automática e
    // precisará logar de novo na próxima ação protegida.
    try {
        await createSession(sessionUser.id, userRole);
    } catch (sessionError) {
        console.error('Failed to reissue session after password update:', sessionError);
    }

    revalidatePath('/dashboard/settings/password');

    await regenerateCsrfToken();

    return { message: true, ts: Date.now() };
}