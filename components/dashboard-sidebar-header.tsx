'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from './ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import React from 'react';
import Link from 'next/link';

type BreadcrumbItemType = {
    text: string;
    href?: string;
};

type DashboardSidebarHeaderProps = {
    items: BreadcrumbItemType[];
};

export function DashboardSidebarHeader({ items }: DashboardSidebarHeaderProps) {
    const lastIndex = items.length - 1;
    return (
        <header className="flex h-10 shrink-0 items-center gap-2 border-b">
            <SidebarTrigger className="ml-1" />
            <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
                <BreadcrumbList>
                    {items.map((item, index) => (
                        <React.Fragment key={index}>
                            <BreadcrumbItem>
                                {index === lastIndex || !item.href ? (
                                    <BreadcrumbPage className="cursor-default">{item.text}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link href={item.href}>
                                            {item.text}
                                        </Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                            {index !== lastIndex && <BreadcrumbSeparator />}
                        </React.Fragment>
                    ))}
                </BreadcrumbList>
            </Breadcrumb>
        </header>
    );
}