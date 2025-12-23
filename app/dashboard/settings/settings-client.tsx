'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/_components/ui/avatar';
import { useInitials } from '@/_hooks/use-initials';
import { formatDate } from '@/_lib/dataformat';
import { UserSettingsClientProps } from '@/_types';
import { BadgeAlert, BadgeCheck } from 'lucide-react';

export default function SettingsPageClient({
    user,
}: UserSettingsClientProps) {
    const getInitials = useInitials();
    return (
        <>
            <div className="flex flex-1 gap-4 cursor-default">
                <div className="size-40 rounded-full overflow-hidden border border-gray-300">
                    <Avatar className="size-full overflow-hidden rounded-full">
                        {user.avatar ? (
                            <AvatarImage
                                src={user.avatar}
                                alt={user.name}
                            />
                        ) : (
                            <AvatarFallback className="font-bold font-pirata text-8xl bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                {getInitials(user.name)}
                            </AvatarFallback>
                        )}
                    </Avatar>
                </div>
                <div className="flex flex-col justify-center gap-2 text-left leading-tight">
                    <div>
                        <strong>ID : </strong>
                        <span className="opacity-0 hover:opacity-100 duration-500 cursor-help">
                            {user.id}
                        </span>
                    </div>
                    <span className="font-extralight font-pirata text-3xl">
                        <strong>{user.name}</strong>
                    </span>
                    <span className="text-muted-foreground truncate text-sm gap-x-1.5 inline-flex">
                        {user.email}
                        {user.email_verified ? <BadgeCheck className="text-green-500" /> : <BadgeAlert className="text-orange-500" />}
                    </span>
                    <div>
                        <strong>Tipo de Conta : </strong>
                        <span className={`font-pirata ${user.role === 'ADMIN' ? 'text-blue-800' : 'text-green-800'}`}>
                            {user.role}
                        </span>
                    </div>
                </div>
            </div>
            <div>
                <strong>User created on : </strong>
                <span>{formatDate(user.created_at)}</span>
            </div>
            <div>
                <strong>User updated on : </strong>
                <span>{formatDate(user.updated_at)}</span>
            </div>
        </>
    );
}