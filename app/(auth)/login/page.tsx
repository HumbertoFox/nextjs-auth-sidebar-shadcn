import { Suspense } from 'react';
import { LoginClient } from '@/app/(auth)/login/login-client';
import { Metadata } from 'next';
import { LoadingLogin } from '@/_components/loadings/loading-login';

export const generateMetadata = async (): Promise<Metadata> => {
    return {
        title: 'Log in'
    };
}

export default function LoginPage() {
    return (
        <Suspense fallback={<LoadingLogin />}>
            <LoginClient />
        </Suspense>
    );
}