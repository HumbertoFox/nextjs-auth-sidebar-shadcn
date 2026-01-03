import { Suspense } from 'react';
import { Metadata } from 'next';
import { LoginClient } from './login-client';
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