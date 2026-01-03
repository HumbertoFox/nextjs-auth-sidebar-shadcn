import { Suspense } from 'react';
import LoadingForgotPassword from '@/_components/loadings/loading-forgot-password';
import ForgotPasswordClient from './forgot-password-client';
import { Metadata } from 'next';

export const generateMetadata = async (): Promise<Metadata> => {
    return {
        title: 'Forgot Password'
    };
}

export default function ForgotPasswordPage() {
    return (
        <Suspense fallback={<LoadingForgotPassword />}>
            <ForgotPasswordClient />
        </Suspense>
    );
}