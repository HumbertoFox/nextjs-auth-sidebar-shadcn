'use client';

import { DashboardSidebarHeader } from '@/components/dashboard-sidebar-header';
import { usePathname } from 'next/navigation';

type HeadingProps = {
    title: string;
    description?: string;
}

type BreadcrumbItemType = {
    text: string;
    href?: string;
}

export default function Heading({ title, description }: HeadingProps) {
    const currentPath = usePathname();
    const breadcrumbMap: Record<string, BreadcrumbItemType[]> = {
        '/dashboard/settings': [
            { text: 'Dashboard', href: '/dashboard' },
            { text: 'Settings' },
        ],
        '/dashboard/settings/profile': [
            { text: 'Dashboard', href: '/dashboard' },
            { text: 'Settings', href: '/dashboard/settings' },
            { text: 'Profile' },
        ],
        '/dashboard/settings/password': [
            { text: 'Dashboard', href: '/dashboard' },
            { text: 'Settings', href: '/dashboard/settings' },
            { text: 'Password' },
        ],
        '/dashboard/settings/appearance': [
            { text: 'Dashboard', href: '/dashboard' },
            { text: 'Settings', href: '/dashboard/settings' },
            { text: 'Appearance' },
        ],
    };
    const breadcrumbItems = breadcrumbMap[currentPath] || [];

    return (
        <>
            <DashboardSidebarHeader items={breadcrumbItems} />
            <div className="mb-8 my-1 px-4 space-y-0.5">
                <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
                {description && <p className="text-muted-foreground text-sm">{description}</p>}
            </div>
        </>
    );
}
