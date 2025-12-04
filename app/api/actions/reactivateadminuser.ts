'use server';

import { UserRepository } from '@/lib/userRepository';
import { revalidatePath } from 'next/cache';

export async function reactivateAdminUserById(formData: FormData) {
    const userId = formData.get('userId') as string;

    if (!userId) return;

    const user = await UserRepository.reactivateById(userId);

    user.role === 'ADMIN'
        ? revalidatePath('/dashboard/admins')
        : revalidatePath('/dashboard/admins/users');
}