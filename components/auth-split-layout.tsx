'use client';

import Link from 'next/link';
import { useEffect, useRef, type PropsWithChildren } from 'react';
import gsap from 'gsap';
import AppLogoIconSvg from '@/components/app-logo-icon-svg';

interface AuthLayoutProps {
    title?: string;
    description?: string;
};

export default function AuthSplitLayout({
    children,
    title,
    description
}: PropsWithChildren<AuthLayoutProps>) {
    const logoRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!logoRef.current) return;
        const tl = gsap.timeline();

        tl.fromTo(
            logoRef.current,
            { x: -500, opacity: 0, scale: 0.8 },
            { x: 0, opacity: 1, scale: 1, duration: 1, ease: 'power3.out' }
        ).to(
            logoRef.current,
            { scale: 1.2, duration: 0.2, ease: 'power1.inOut', yoyo: true, repeat: 3 }
        );
    }, []);
    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="bg-muted relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0 bg-zinc-900" />
                <div className="flex">
                    <Link href="/" className="relative z-20 flex items-center text-lg font-medium">
                        <AppLogoIconSvg className="mr-2 size-8 fill-current" />
                        NextJs
                    </Link>
                </div>
                <div className="flex items-center justify-center h-full z-10">
                    <div ref={logoRef} className="opacity-0">
                        <AppLogoIconSvg className="size-50 fill-white dark:bg-black rounded-full" />
                    </div>
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg">&ldquo;Teste&rdquo;</p>
                        <footer className="text-sm text-neutral-300">Teste</footer>
                    </blockquote>
                </div>
            </div>
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Link href="/" className="relative z-20 flex items-center justify-center lg:hidden">
                        <AppLogoIconSvg className="h-10 fill-current text-black sm:h-12" />
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-xl font-medium">{title}</h1>
                        <p className="text-muted-foreground text-sm text-balance">{description}</p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
