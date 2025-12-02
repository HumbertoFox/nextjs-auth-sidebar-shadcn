import AuthSplitLayout from '@/components/auth-split-layout';
import { type PropsWithChildren } from 'react';

export default function SettingsLayout({ children }: PropsWithChildren) {
    return (
        <>
            <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12 px-4">
                <AuthSplitLayout />
                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl flex flex-col gap-4 p-4">{children}</section>
                </div>
            </div>
        </>
    );
}