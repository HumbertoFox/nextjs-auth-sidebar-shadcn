'use client';

import AppLogoIconSvg from '@/_components/app-logo-icon-svg';

export default function AppLogoSvg() {
    return (
        <div className="flex items-center gap-1">
            <div className="flex aspect-square size-8 items-center justify-center rounded-full dark:invert">
                <AppLogoIconSvg />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">NextJs + Shadcn + Neon</span>
            </div>
        </div>
    );
}