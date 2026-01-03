'use server';

import { getUser } from '@/_lib/dal';
import { UserRepository } from '@/_lib/userrepository';
import { revalidatePath } from 'next/cache';

export async function reactivateAdminUserById(formData: FormData) {
    const userId = formData.get('userId') as string;

    const sessionUser = await getUser();
    if (!sessionUser || sessionUser.role !== 'ADMIN') return;

    if (!userId) return;

    const user = await UserRepository.reactivateById(userId);

    if (user.role === 'ADMIN') {
        revalidatePath('/dashboard/admins')
    } else {
        revalidatePath('/dashboard/admins/users');
    };
}