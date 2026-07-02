'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/_lib/utils';
import { SidebarNavItemProps } from '@/_types';

const sidebarNavItems: SidebarNavItemProps[] = [
    { text: 'Settings', href: '/dashboard/settings' },
    { text: 'Profile', href: '/dashboard/settings/profile' },
    { text: 'Verify Email', href: '/dashboard/settings/verify-email' },
    { text: 'Password', href: '/dashboard/settings/password' },
    { text: 'Appearance', href: '/dashboard/settings/appearance' }
];

export default function SettingsLayoutClient({ emailVerified }: { emailVerified: boolean; }) {
    const currentPath = usePathname();

    const visibleItems = sidebarNavItems.filter(item =>
        item.href !== '/dashboard/settings/verify-email' || !emailVerified
    );
    return (
        <aside className="w-full max-w-xl lg:w-32">
            <nav className="flex flex-col space-y-1 space-x-0">
                {visibleItems.map((item, index) => (
                    <Link
                        key={`${item.href}-${index}`}
                        href={item.href}
                        className={cn('text-sm hover:text-blue-500 mr-auto p-1 transition-colors duration-200', {
                            'text-blue-500 font-medium italic': currentPath === item.href,
                        })}
                        prefetch
                    >
                        {item.text}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}