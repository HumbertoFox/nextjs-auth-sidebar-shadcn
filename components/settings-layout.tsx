'use client';

import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type NavItem = {
    text: string;
    href: string;
}

export default function SettingsLayoutComponents() {
    const currentPath = usePathname();
    const sidebarNavItems: NavItem[] = [
        { text: 'settings', href: '/dashboard/settings', },
        { text: 'Profile', href: '/dashboard/settings/profile', },
        { text: 'Password', href: '/dashboard/settings/password', },
        { text: 'Appearance', href: '/dashboard/settings/appearance', },
    ];
    return (
        <aside className="w-full max-w-xl lg:w-48">
            <nav className="flex flex-col space-y-1 space-x-0">
                {sidebarNavItems.map((item, index) => (
                    <Button
                        key={`${item.href}-${index}`}
                        size="sm"
                        variant="ghost"
                        asChild
                        className={cn('w-full justify-start', {
                            'bg-muted': currentPath === item.href,
                        })}
                    >
                        <Link href={item.href} prefetch>
                            {item.text}
                        </Link>
                    </Button>
                ))}
            </nav>
        </aside>
    );
}