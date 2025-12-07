import { Suspense } from 'react';
import { LoginClient } from '@/app/(auth)/login/login-client';
import { Metadata } from 'next';
import { LoadingLoginSplit } from '@/_components/loadings/loading-login-split';

export const generateMetadata = async (): Promise<Metadata> => {
    return {
        title: 'Log in'
    };
}

export default function LoginPage() {
    return (
        <Suspense fallback={<LoadingLoginSplit />}>
            <LoginClient />
        </Suspense>
    );
}