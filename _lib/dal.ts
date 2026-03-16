import 'server-only';
import { cache } from 'react';
import { verifySession } from '@/_lib/session';
import { userRepository } from '@/_lib/userrepository';
import { UserDetailsProps } from '@/_types';

export const getUser = cache(async () => {
    const session = await verifySession();
    if (!session) return null;

    try {
        const user: UserDetailsProps = await userRepository.findPublicById(session.userId);

        if (!user) return null;

        return user;
    } catch (error) {
        console.log('Failed to fetch user', error);
        return null;
    };
})