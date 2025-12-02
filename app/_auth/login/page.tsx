import { Suspense } from 'react';
import { LoginClient } from '@/app/_auth/login/login-client';
import { Metadata } from 'next';
import { LoadingLoginSplit } from '@/components/loadings/loading-login-split';

export const generateMetadata = async (): Promise<Metadata> => {
    return {
        title: 'Conecte-se'
    };
};

export default function LoginPage() {
    return (
        <Suspense fallback={<LoadingLoginSplit />}>
            <LoginClient />
        </Suspense>
    );
}