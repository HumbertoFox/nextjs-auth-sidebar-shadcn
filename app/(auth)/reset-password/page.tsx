import { Suspense } from 'react';
import ResetPasswordClient from './reset-password-client';
import LoadingResetPassword from '@/_components/loadings/loading-reset-password';
import { Metadata } from 'next';

export const generateMetadata = async (): Promise<Metadata> => {
    return {
        title: 'Reset Password'
    };
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<LoadingResetPassword />}>
            <ResetPasswordClient />
        </Suspense>
    );
}