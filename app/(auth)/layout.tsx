import { type PropsWithChildren } from 'react';
import AuthSplitLayoutClient from './auth-split-layout-client';

export default function SettingsLayout({
    children,
}: PropsWithChildren) {
    return (
        <>
            <div className="flex flex-col lg:flex-row lg:space-y-0">
                <AuthSplitLayoutClient />
                <section className="w-full flex justify-center items-center h-screen">
                    {children}
                </section>
            </div>
        </>
    );
}