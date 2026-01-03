import { Metadata } from 'next';
import PasswordPageClient from './password-client';
import LoadingPassword from '@/_components/loadings/loading-password';
import { Suspense } from 'react';

export const generateMetadata = async (): Promise<Metadata> => {
    return {
        title: 'Update Password User'
    };
}

export default function PasswordPage() {
    return (
        <Suspense fallback={<LoadingPassword />}>
            <PasswordPageClient />
        </Suspense>
    );
}