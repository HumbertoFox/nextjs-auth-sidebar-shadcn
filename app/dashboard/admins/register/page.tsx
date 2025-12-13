import { DashboardSidebarHeader } from '@/_components/dashboard-sidebar-header';
import { Metadata } from 'next';
import RegisterUser from '@/_components/form-register-user';

export const generateMetadata = async (): Promise<Metadata> => {
    return {
        title: 'Register User'
    };
}

export default function RegisterUsersPage() {
    const breadcrumbItems = [
        { text: 'Dashboard', href: '/dashboard' },
        { text: 'Admins', href: '/dashboard/admins' },
        { text: 'Register', },
    ];
    return (
        <>
            <DashboardSidebarHeader items={breadcrumbItems} />
            <RegisterUser
                titleForm="Register User Acount"
                valueButton="Register"
            />
        </>
    );
}