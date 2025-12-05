import DashboardSidebar from '@/_components/dashboard-sidebar';
import { SidebarInset, SidebarProvider, } from '@/_components/ui/sidebar';

const user = {
    name: "shadcn Ui",
    email: "shadcn.ui@example.com",
};

export default function DashboardLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SidebarProvider>
            <DashboardSidebar user={user} />
            <SidebarInset>
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}