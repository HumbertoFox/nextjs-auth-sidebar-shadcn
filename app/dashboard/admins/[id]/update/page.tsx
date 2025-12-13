import { DashboardSidebarHeader } from '@/_components/dashboard-sidebar-header';
import RegisterUpdateUserForm from '@/_components/form-register-user';
import { UserRepository } from '@/_lib/userrepository';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const generateMetadata = async (): Promise<Metadata> => {
    return {
        title: 'Update User'
    };
}

export default async function Update({
    params,
}: { params: Promise<{ id: string }> }) {
    const breadcrumbItems = [
        { text: 'Dashboard', href: '/dashboard' },
        { text: 'Admins', href: '/dashboard/admins' },
        { text: 'Update User', },
    ];
    const { id } = await params;
    const user = await UserRepository.findById(id);
    if (!user) redirect('/dashboard');
    return (
        <>
            <DashboardSidebarHeader items={breadcrumbItems} />
            <RegisterUpdateUserForm
                user={user}
                isEdit={true}
                titleForm="Update User Acount"
                valueButton="Update Account"
            />
        </>
    );
}