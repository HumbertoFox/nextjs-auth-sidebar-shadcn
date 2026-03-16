import { DashboardSidebarHeader } from '@/_components/dashboard-sidebar-header';
import RegisterUpdateUserForm from '@/_components/form-register-user';
import { LoadingRegister } from '@/_components/loadings/loading-register';
import { getCsrfToken } from '@/_lib/csrf';
import { userRepository } from '@/_lib/userrepositorys';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export const generateMetadata = async (): Promise<Metadata> => {
    return {
        title: 'Update User'
    };
}

export default async function Update({
    params,
}: { params: Promise<{ id: string }> }) {
    const breadcrumbItems = [
        {
            text: 'Dashboard',
            href: '/dashboard'
        },
        {
            text: 'Admins',
            href: '/dashboard/admins'
        },
        {
            text: 'Update User'
        },
    ];
    const { id } = await params;
    const user = await userRepository.findById(id);
    if (!user) redirect('/dashboard');
    const csrfToken = await getCsrfToken();
    return (
        <>
            <DashboardSidebarHeader items={breadcrumbItems} />
            <Suspense fallback={<LoadingRegister />}>
                <RegisterUpdateUserForm
                    user={user}
                    isEdit={true}
                    titleForm="Update User Acount"
                    valueButton="Update Account"
                    csrfToken={csrfToken}
                />
            </Suspense>
        </>
    );
}