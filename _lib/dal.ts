import 'server-only';
import { cache } from 'react';
import { verifySession } from '@/_lib/session';
import { userRepository } from '@/_lib/userrepositorys';
import { UserDetailsProps } from '@/_types';

export const getUser = cache(async () => {
    const session = await verifySession();
    if (!session) return null;

    try {
        const user = await userRepository.findPublicById(session.userId);

        if (!user) return null;

        const { password: _, ...safeUser } = user;

        return safeUser as UserDetailsProps;
    } catch (error) {
        console.log('Failed to fetch user', error);
        return null;
    };
})