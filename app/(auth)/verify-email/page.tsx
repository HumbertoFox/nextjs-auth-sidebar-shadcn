import { Suspense } from 'react';
import VerifyEmailClient from './verify-email-client';
import LoadingVerifyEmail from '@/_components/loadings/loading-verify-email';
import { Metadata } from 'next';

export const generateMetadata = async (): Promise<Metadata> => {
    return {
        title: 'Verify E-mail'
    };
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<LoadingVerifyEmail />}>
            <VerifyEmailClient />
        </Suspense>
    );
}