import { getUser } from '@/_lib/dal';
import { ProfilePageClient } from './profile-client';

type UserProps = {
    name: string;
    email: string;
    avatar?: string | null;
    email_verified?: string | null;
};

export default async function ProfilePage() {
    const user = await getUser() as UserProps;
    const mustVerifyEmail: boolean = !Boolean(user.email_verified);
    return (
        <>
            <ProfilePageClient
                name={user.name}
                email={user.email}
                avatar={user.avatar}
                mustVerifyEmail={mustVerifyEmail}
            />
        </>
    );
}