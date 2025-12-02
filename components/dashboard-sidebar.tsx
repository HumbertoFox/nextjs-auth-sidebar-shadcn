'use client';

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail, } from '@/components/ui/sidebar';
import AppLogoSvg from '@/components/app-logo-svg';
import Link from 'next/link';
import { NavMainAdmins } from '@/components/nav-main-admins';
import { LayoutGrid, LucideIcon, UserRoundCog, UserRoundPlus, UsersRound } from 'lucide-react';
import { NavMainUsers } from '@/components/nav-main-users';
import { NavUser } from './nav-user';

type NavItem = {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

type UserProps = {
    name: string;
    email: string;
    avatar?: string;
};

type DashboardSidebarProps = React.ComponentProps<typeof Sidebar> & {
    user: UserProps;
};

export default function DashboardSidebar({ user, ...props }: DashboardSidebarProps) {
    const adminNavItems: NavItem[] = [
        { title: 'Admins', href: '/dashboard/admins', icon: UserRoundCog },
        { title: 'Users', href: '/dashboard/admins/users', icon: UsersRound },
        { title: 'Register User', href: '/dashboard/admins/register', icon: UserRoundPlus },
    ];
    const userNavItems: NavItem[] = [
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
            <SidebarContent>
                <NavMainAdmins items={adminNavItems} />
            </SidebarContent>
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