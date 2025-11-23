'use client';

import AppLogoIconSvg from '@/components/app-logo-icon-svg';

export default function AppLogoSvg() {
    return (
        <div className="flex items-center gap-1">
            <div className="bg-black flex aspect-square size-8 items-center justify-center rounded-full dark:bg-white">
                <AppLogoIconSvg className="fill-current text-white dark:text-black" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">NextJs + Shadcn Ui</span>
            </div>
        </div>
    );
}