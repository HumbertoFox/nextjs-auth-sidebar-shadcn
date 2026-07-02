import Heading from '@/_components/heading';
import { Separator } from '@/_components/ui/separator';
import { type PropsWithChildren } from 'react';
import SettingsLayoutClient from './settings-layout-client';
import { getUser } from '@/_lib/dal';
import { UserProfilePageProps } from '@/_types';

export default async function SettingsLayout({ children }: PropsWithChildren) {
    const user = await getUser() as UserProfilePageProps;
    return (
        <>
            <Heading
                title="Settings"
                description="Manage your profile and account settings."
            />
            <div className="flex flex-col space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12 px-2">
                <SettingsLayoutClient emailVerified={!!user?.email_verified} />
                <Separator className="my-6 md:hidden" />
                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl flex flex-col gap-4 p-4">
                        {children}
                    </section>
                </div>
            </div>
        </>
    );
}