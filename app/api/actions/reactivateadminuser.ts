'use server';

import { UserRepository } from '@/_lib/userrepository';
import { revalidatePath } from 'next/cache';

export async function reactivateAdminUserById(formData: FormData) {
    const userId = formData.get('userId') as string;

    if (!userId) return;

    const user = await UserRepository.reactivateById(userId);

    if (user.role === 'ADMIN') {
        revalidatePath('/dashboard/admins')
    } else {
        revalidatePath('/dashboard/admins/users');
    }
}