import { DashboardSidebarHeader } from '@/_components/dashboard-sidebar-header';
import LoadingUsers from '@/_components/loadings/loading-users';
import { Metadata } from 'next';
import { Suspense } from 'react';
import AdminsTable from './admins-table';

export const generateMetadata = async (): Promise<Metadata> => {
    return {
        title: 'Administrators'
    };
}

export default async function AdminsPage() {
    const breadcrumbItems = [
        { text: 'Dashboard', href: '/dashboard' },
        { text: 'Admins' },
    ];
    return (
        <>
            <DashboardSidebarHeader items={breadcrumbItems} />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <Suspense fallback={<LoadingUsers />}>
                    <AdminsTable />
                </Suspense>
            </div>
        </>
    );
}