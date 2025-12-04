import AuthSplitLayout from '@/components/auth-split-layout';
import { type PropsWithChildren } from 'react';

export default function SettingsLayout({ children }: PropsWithChildren) {
    return (
        <>
            <div className="flex flex-col lg:flex-row lg:space-y-0">
                <AuthSplitLayout />
                <section className="w-full flex justify-center items-center h-screen">
                    {children}
                </section>
            </div>
        </>
    );
}