'use client';

import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { LogOut, Settings } from 'lucide-react';
import Link from 'next/link';

type UserProps = {
    name: string;
    email: string;
    avatar?: string;
};

type UserTypeProps = {
    user: UserProps;
};

export function UserMenuContent({ user }: UserTypeProps) {
    const cleanup = useMobileNavigation();
    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm cursor-default">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href="/dashboard/settings/profile"
                        prefetch
                        onClick={cleanup}
                    >
                        <Settings className="mr-2" />
                        Settings
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link
                    className="block w-full cursor-pointer"
                    href="/logout"
                    onClick={cleanup}
                >
                    <LogOut className="mr-2" />
                    Exit
                </Link>
            </DropdownMenuItem>
        </>
    );
}
