import { Metadata } from 'next';
import AppearancePageClient from './appearance-client';

export const generateMetadata = async (): Promise<Metadata> => {
    return {
        title: 'Appearance of System'
    };
}

export default function AppearancePage() {
    return (
        <AppearancePageClient />
    );
}