'use client';

import { Skeleton } from '@/_components/ui/skeleton';

export function LoadingLogin() {
    return (
        <div className="w-full 2xl:w-2/4 2xl:p-8">
            <div className="flex w-80 flex-col items-center gap-6 mx-auto">
                <Skeleton className="size-16 2xl:hidden rounded-full mx-auto" />

                <div className="w-full grid gap-2">
                    <Skeleton className="h-5 w-44 mx-auto" />
                    <Skeleton className="h-3.5 w-64 mx-auto" />
                </div>

                <div className="w-full grid gap-2 mb-6">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-9 w-full" />
                </div>

                <div className="w-full grid gap-2">
                    <div className="flex justify-between">
                        <Skeleton className="h-3.5 w-25" />
                        <Skeleton className="h-3.5 w-36" />
                    </div>
                    <Skeleton className="h-9 w-full" />
                </div>

                <div className="w-full grid gap-6">
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-3.5 w-52 mx-auto" />
                </div>
            </div>
        </div>
    );
}