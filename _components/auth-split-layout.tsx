'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import AppLogoIconSvg from '@/_components/app-logo-icon-svg';

export default function AuthSplitLayout() {
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
        <div className="min-w-1/2 h-dvh hidden flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:px-0 lg:block">
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
        </div>
    );
}
