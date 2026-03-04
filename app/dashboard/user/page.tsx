import { DashboardSidebarHeader } from '@/_components/dashboard-sidebar-header';
import { getUser } from '@/_lib/dal';
import { UserDetailsProps } from '@/_types';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const generateMetadata = async (): Promise<Metadata> => {
    return {
        title: 'User'
    };
}

export default async function UserPage() {
    const user = await getUser() as UserDetailsProps;
    if (!user || (user.role !== 'ADMIN' && user.role !== 'USER')) redirect('/dashboard');
    const breadcrumbItems = [
        {
            text: 'Dashboard',
            href: '/dashboard'
        },
        {
            text: 'User'
        },
    ];
    return (
        <>
            <DashboardSidebarHeader items={breadcrumbItems} />
        </>
    );
}