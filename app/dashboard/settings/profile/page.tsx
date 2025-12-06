import { getUser } from '@/_lib/dal';
import { ProfilePageClient } from './profile-client';
import { UserProfilePageProps } from '@/_types';


export default async function ProfilePage() {
    const user = await getUser() as UserProfilePageProps;
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