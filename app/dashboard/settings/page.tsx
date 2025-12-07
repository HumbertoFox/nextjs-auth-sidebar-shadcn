import { getUser } from '@/_lib/dal';
import SettingsPageClient from './settings-client';
import { UserDetailsProps } from '@/_types';
import { Metadata } from 'next';

export const generateMetadata = async (): Promise<Metadata> => {
    return {
        title: 'Settings'
    };
}

export default async function SettingsPage() {
    const user = await getUser() as UserDetailsProps;
    return (
        <SettingsPageClient user={user} />
    );
}