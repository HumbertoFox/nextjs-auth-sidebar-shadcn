import { getUser } from '@/_lib/dal';
import { ProfilePageClient } from './profile-client';
import { UserProfilePageProps } from '@/_types';
import { Metadata } from 'next';

export const generateMetadata = async (): Promise<Metadata> => {
    return {
        title: 'Profile of User'
    };
}

export default async function ProfilePage() {
    const user = await getUser() as UserProfilePageProps;
    const mustVerifyEmail: boolean = !Boolean(user.email_verified);
    return (
        <ProfilePageClient
            name={user.name}
            email={user.email}
            avatar={user.avatar}
            mustVerifyEmail={mustVerifyEmail}
        />
    );
}