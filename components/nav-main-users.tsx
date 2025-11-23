'use client';

import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export function NavMainUsers({ items = [] }: { items: NavItem[] }) {
    const pathname = usePathname();
    const { isMobile, setOpenMobile } = useSidebar();

    const handleLinkClick = () => {
        if (isMobile) {
            setOpenMobile(false);
        };
    };
    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Users</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild isActive={item.href === pathname}
                            tooltip={{ children: item.title }}
                        >
                            <Link href={item.href} prefetch onClick={handleLinkClick}>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}