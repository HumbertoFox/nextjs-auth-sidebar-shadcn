import DashboardSidebar from '@/_components/dashboard-sidebar';
import { SidebarInset, SidebarProvider, } from '@/_components/ui/sidebar';
import { getUser } from '@/_lib/dal';

export default async function DashboardLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    const user = await getUser();
    return (
        <SidebarProvider>
            <DashboardSidebar user={user} />
            <SidebarInset>
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}