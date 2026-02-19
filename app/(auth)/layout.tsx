import { type PropsWithChildren } from 'react';
import AuthSplitLayoutClient from './auth-split-layout-client';

export default function SettingsLayout({
    children,
}: PropsWithChildren) {
    return (
        <>
            <div className="flex flex-col lg:flex-row lg:space-y-0">
                <AuthSplitLayoutClient />
                <section className="w-full flex justify-end items-center min-h-screen">
                    {children}
                </section>
            </div>
        </>
    );
}