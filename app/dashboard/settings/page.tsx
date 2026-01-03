import { getUser } from '@/_lib/dal';
import SettingsPageClient from './settings-client';
import { UserDetailsProps } from '@/_types';
import { Metadata } from 'next';
import LoadingSettings from '@/_components/loadings/loading-settings';
import { Suspense } from 'react';

export const generateMetadata = async (): Promise<Metadata> => {
    return {
        title: 'Settings'
    };
}

export default async function SettingsPage() {
    const user = await getUser() as UserDetailsProps;
    return (
        <Suspense fallback={<LoadingSettings />}>
            <SettingsPageClient user={user} />
        </Suspense>
    );
}