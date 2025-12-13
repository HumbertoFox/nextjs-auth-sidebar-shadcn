import { Metadata } from 'next';
import PasswordPageClient from './password-client';

export const generateMetadata = async (): Promise<Metadata> => {
    return {
        title: 'Update Password User'
    };
}

export default function PasswordPage() {
    return (
        <PasswordPageClient />
    );
}