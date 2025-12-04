import 'server-only';
import { cache } from 'react';
import { verifySession } from '@/lib/session';
import { UserRepository } from '@/lib/userRepository';

export const getUser = cache(async () => {
    const session = await verifySession();
    if (!session) return null;

    try {
        const user = await UserRepository.findPublicById(session.userId);

        if (!user) return null;

        return user;
    } catch (error) {
        console.log('Failed to fetch user', error);
        return null;
    };
})