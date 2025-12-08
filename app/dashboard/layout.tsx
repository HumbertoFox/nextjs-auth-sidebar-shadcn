import DashboardSidebar from '@/_components/dashboard-sidebar';
import { SidebarInset, SidebarProvider, } from '@/_components/ui/sidebar';
import { getUser } from '@/_lib/dal';
import { UserDetailsProps } from '@/_types';

export default async function DashboardLayout({
    children,
}: Readonly<{ children: React.ReactNode; }>) {
    const user = await getUser() as UserDetailsProps;
    return (
        <SidebarProvider>
            <DashboardSidebar user={user} />
            <SidebarInset>
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}