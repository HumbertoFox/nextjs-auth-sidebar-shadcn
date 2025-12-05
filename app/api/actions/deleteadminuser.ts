'use server';

import { UserRepository } from '@/_lib/userRepository';
import { revalidatePath } from 'next/cache';

export async function deleteUserById(formData: FormData) {
    const userId = formData.get('userId') as string;

    if (!userId) return;

    try {
        const user = await UserRepository.findActiveById(userId);

        if (!user) return;

        await UserRepository.softDeleteById(userId);

        if (user?.role === 'ADMIN') {
            revalidatePath('/dashboard/admins');
        } else if (user?.role === 'USER') {
            revalidatePath('/dashboard/users');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
    }
}