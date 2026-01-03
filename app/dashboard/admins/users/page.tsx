import { DashboardSidebarHeader } from '@/_components/dashboard-sidebar-header';
import { Metadata } from 'next';
import UsersTable from './users-table';
import { Suspense } from 'react';
import LoadingUsers from '@/_components/loadings/loading-users';

export const generateMetadata = async (): Promise<Metadata> => {
    return {
        title: 'Users'
    };
}

export default async function UsersPage() {
    const breadcrumbItems = [
        { text: 'Dashboard', href: '/dashboard' },
        { text: 'Admins', href: '/dashboard/admins' },
        { text: 'Users', },
    ];
    return (
        <>
            <DashboardSidebarHeader items={breadcrumbItems} />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <Suspense fallback={<LoadingUsers />}>
                    <UsersTable />
                </Suspense>
            </div>
        </>
    );
}