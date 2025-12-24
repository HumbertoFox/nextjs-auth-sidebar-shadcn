'use client';

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail, } from '@/_components/ui/sidebar';
import AppLogoSvg from '@/_components/app-logo-svg';
import Link from 'next/link';
import { NavMainAdmins } from '@/_components/nav-main-admins';
import { LayoutGrid, UserRoundCog, UserRoundPlus, UsersRound } from 'lucide-react';
import { NavMainUsers } from '@/_components/nav-main-users';
import { NavUser } from '@/_components/nav-user';
import { NavMainItemProps, ProfileForm } from '@/_types';

type DashboardSidebarProps = React.ComponentProps<typeof Sidebar> & {
    user: ProfileForm;
    isAdmin: boolean;
}

export default function DashboardSidebar({
    user,
    isAdmin,
    ...props
}: DashboardSidebarProps) {
    const adminNavItems: NavMainItemProps[] = [
        { title: 'Admins', href: '/dashboard/admins', icon: UserRoundCog },
        { title: 'Users', href: '/dashboard/admins/users', icon: UsersRound },
        { title: 'Register User', href: '/dashboard/admins/register', icon: UserRoundPlus },
    ];
    const userNavItems: NavMainItemProps[] = [
        { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid, },
    ];
    return (
        <Sidebar collapsible="icon" variant="floating" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogoSvg />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            {isAdmin && (
                <SidebarContent>
                    <NavMainAdmins items={adminNavItems} />
                </SidebarContent>
            )}
            <SidebarContent>
                <NavMainUsers items={userNavItems} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}