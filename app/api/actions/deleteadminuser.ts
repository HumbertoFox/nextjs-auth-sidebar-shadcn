'use server';

import { regenerateCsrfToken, validateCsrfToken } from '@/_lib/csrf';
import { getUser } from '@/_lib/dal';
import { userRepository } from '@/_lib/userrepository';
import { revalidatePath } from 'next/cache';

export async function deleteUserById(
    formData: FormData
) {
    const csrfToken = formData.get('csrfToken') as string;
    const isValidCsrf = await validateCsrfToken(csrfToken);

    if (!isValidCsrf) return;

    const userId = formData.get('userId') as string;

    const sessionUser = await getUser();
    if (!sessionUser || sessionUser.role !== 'ADMIN') return;

    if (!userId) return;

    try {
        const user = await userRepository.findActiveById(userId);

        if (!user) return;

        await userRepository.softDeleteById(userId);

        await regenerateCsrfToken();

        if (user.role === 'ADMIN') {
            revalidatePath('/dashboard/admins');
        } else if (user.role === 'USER') {
            revalidatePath('/dashboard/users');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
    }
}