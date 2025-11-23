Criando o app com o NextJS!

```bash

    npx create-next-app@latest nextjs-auth-sidebar-shadcn

```

Onde o comando `npx create-next-app@latest` comando para criar o app e `nextjs-auth-sidebar-shadcn` foi o nome que dei ao app!

Criando repositório para o app no github

Criei um repositório e uma nova branch `dev-main`!

Fiz o clone no meu repositório de desenvolvimento local

```bash

    git clone -b dev-main https://github.com/HumbertoFox/nextjs-auth-sidebar-shadcn.git

```

Primeiro commit no repositório

Adicionando as mudanças

```bash

    git add .
    
```

Comentando as mudanças

```bash

    git commit -m "First commit"
    
```

Subindo as mudanças para a branch dev-main

```bash

    git push
    
```

Criando diretório Dashboard e Layout

```bash

    mkdir app/dashboard
    touch app/dashboard/layout.tsx

```

Layout dashboard `app/dashboard/layout.tsx`

```tsx
    // app/dashboard/layout.tsx

    export default function DashboardLayout({
        children
    }: Readonly<{
        children: React.ReactNode;
    }>) {
        return (
            <>
                {children}
            </>
        );
    }

```

Criando a página do dashboard

```bash

    touch app/dashboard/page.tsx

```

```tsx
    // app/dashboard/page.tsx

    export default function DashboardPage() {
        return (
            <h1>Dashboard Page</h1>
        );
    }

```

Instalando libs Shadcn para o Sidebar

```bash

    npx shadcn@latest add sidebar
    npx shadcn@latest add breadcrumb
    npm install next-themes

```

Criando componente sidebar `components/dashboard-sidebar.tsx`

```bash

    touch components/dashboard-sidebar.tsx

```

Editando layout para rederizar dashboard sidebar no layout


```tsx
    // app/dashboard/layout.tsx

    import DashboardSidebar from '@/components/dashboard-sidebar';
    import { DashboardSidebarHeader } from '@/components/dashboard-sidebar-header';
    import { SidebarInset, SidebarProvider, } from '@/components/ui/sidebar';

    export default function DashboardLayout({
        children
    }: Readonly<{
        children: React.ReactNode;
    }>) {
        return (
            <SidebarProvider>
                <DashboardSidebar />
                <SidebarInset>
                    <DashboardSidebarHeader />
                    {children}
                </SidebarInset>
            </SidebarProvider>
        );
    }

```


```tsx
    // components/dashboard-sidebar.tsx

    'use client';

    import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader, SidebarRail, } from '@/components/ui/sidebar';

    export default function DashboardSidebar({
        ...props
    }: React.ComponentProps<typeof Sidebar>) {
        return (
            <Sidebar collapsible="offcanvas" {...props}>
                <SidebarHeader />
                <SidebarContent>
                    <SidebarGroup />
                    <SidebarGroup />
                </SidebarContent>
                <SidebarFooter />
                <SidebarRail />
            </Sidebar>
        );
    }

```

Página dashboard

```tsx
    // app/dashboard/page.tsx

    import { DashboardSidebarHeader } from '@/components/dashboard-sidebar-header';

    export default function DashboardPage() {
        const breadcrumbItems = [{ text: 'Dashboard' },];
        return (
            <>
                <DashboardSidebarHeader items={breadcrumbItems} />
                <div className="flex flex-1 flex-col gap-4 p-4">
                    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                        {[...Array(3)].map((_, index) => (
                            <div key={index} className="bg-muted/50 aspect-video rounded-xl" />
                        ))}
                    </div>
                    <div className="bg-muted/50 min-h-screen flex-1 rounded-xl md:min-h-min" />
                </div>
            </>
        );
    }

```

Sidebar Header para navegar entre pages anteriores

```tsx
    // components/dashboard-sidebar-header.tsx

    'use client';

    import { SidebarTrigger } from '@/components/ui/sidebar';
    import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
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
                <SidebarTrigger className="ml-1 cursor-pointer" />
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

```

Página de Administradores, Usuários e Registro Usuário

```tsx
    // app/adshboard/admins/page.tsx

    import { DashboardSidebarHeader } from '@/components/dashboard-sidebar-header';

    export default function AdminsPage() {
        const breadcrumbItems = [
            { text: 'Dashboard', href: '/dashboard' },
            { text: 'Admins' },
        ];
        return (
            <>
                <DashboardSidebarHeader items={breadcrumbItems} />
                <div className="flex flex-1 flex-col gap-4 p-4">
                    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                        {[...Array(3)].map((_, index) => (
                            <div key={index} className="bg-muted/50 aspect-video rounded-xl" />
                        ))}
                    </div>
                    <div className="bg-muted/50 min-h-screen flex-1 rounded-xl md:min-h-min" />
                </div>
            </>
        );
    }

```

```tsx
    // app/dashboard/admins/users/page.tsx

    import { DashboardSidebarHeader } from '@/components/dashboard-sidebar-header';

    export default function UsersPage() {
        const breadcrumbItems = [
            { text: 'Dashboard', href: '/dashboard' },
            { text: 'Admins', href: '/dashboard/admins' },
            { text: 'Users', },
        ];
        return (
            <>
                <DashboardSidebarHeader items={breadcrumbItems} />
                <div className="flex flex-1 flex-col gap-4 p-4">
                    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                        {[...Array(3)].map((_, index) => (
                            <div key={index} className="bg-muted/50 aspect-video rounded-xl" />
                        ))}
                    </div>
                    <div className="bg-muted/50 min-h-screen flex-1 rounded-xl md:min-h-min" />
                </div>
            </>
        );
    }

```

```tsx
    // app/dashboard/admins/register/page.tsx

    import { DashboardSidebarHeader } from '@/components/dashboard-sidebar-header';

    export default function RegisterUsersPage() {
        const breadcrumbItems = [
            { text: 'Dashboard', href: '/dashboard' },
            { text: 'Admins', href: '/dashboard/admins' },
            { text: 'Register', },
        ];
        return (
            <>
                <DashboardSidebarHeader items={breadcrumbItems} />
                <div className="flex flex-1 flex-col gap-4 p-4">
                    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                        {[...Array(3)].map((_, index) => (
                            <div key={index} className="bg-muted/50 aspect-video rounded-xl" />
                        ))}
                    </div>
                    <div className="bg-muted/50 min-h-screen flex-1 rounded-xl md:min-h-min" />
                </div>
            </>
        );
    }

```

Adicionando icone no sidebar

```tsx
    // components/dashboard-sidebar.tsx

    'use client';

    import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail, } from '@/components/ui/sidebar';
    import AppLogoSvg from '@/components/app-logo-svg';
    import Link from 'next/link';

    export default function DashboardSidebar({
        ...props
    }: React.ComponentProps<typeof Sidebar>) {
        return (
            <Sidebar collapsible="offcanvas" {...props}>
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <Link href="/dashboard">
                                    <AppLogoSvg />
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup />
                    <SidebarGroup />
                </SidebarContent>
                <SidebarFooter />
                <SidebarRail />
            </Sidebar>
        );
    }

```

Logo svg do next <a href="https://devicon.dev/">DEVICON</a> icons

```tsx
    // components/app-logo-icon-svg.tsx

    'use client';

    import { SVGAttributes } from 'react';

    export default function AppLogoIconSvg(props: SVGAttributes<SVGElement>) {
        return (
            <svg {...props} viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M64 0A64 64 0 0 0 0 64a64 64 0 0 0 64 64 64 64 0 0 0 35.508-10.838L47.014 49.34v40.238H38.4V38.4h10.768l57.125 73.584A64 64 0 0 0 128 64 64 64 0 0 0 64 0Zm17.777 38.4h8.534v48.776L81.777 75.97Zm24.18 73.92-.111.096a64 64 0 0 0 .111-.096z"
                />
            </svg>
        );
    }

```

Componente Icone com texto

```tsx
    // components/app-logo-svg.tsx

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

```

Ajustando o sidebar para exibir os links das páginas

```tsx
    // components/dashboard-sidebar.tsx

    'use client';

    import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail, } from '@/components/ui/sidebar';
    import AppLogoSvg from '@/components/app-logo-svg';
    import Link from 'next/link';
    import { NavMainAdmins } from '@/components/nav-main-admins';
    import { LayoutGrid, LucideIcon, UserRoundCog, UserRoundPlus, UsersRound } from 'lucide-react';
    import { NavMainUsers } from '@/components/nav-main-users';

    type NavItem = {
        title: string;
        href: string;
        icon?: LucideIcon | null;
        isActive?: boolean;
    }

    export default function DashboardSidebar({
        ...props
    }: React.ComponentProps<typeof Sidebar>) {
        const adminNavItems: NavItem[] = [
            { title: 'Admins', href: '/dashboard/admins', icon: UserRoundCog },
            { title: 'Users', href: '/dashboard/admins/users', icon: UsersRound },
            { title: 'Register User', href: '/dashboard/admins/register', icon: UserRoundPlus },
        ];
        const userNavItems: NavItem[] = [
            { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid, },
        ];
        return (
            <Sidebar collapsible="offcanvas" {...props}>
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <Link href="/dashboard" prefetch>
                                    <AppLogoSvg />
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>
                <SidebarContent>
                    <NavMainAdmins items={adminNavItems} />
                    <NavMainUsers items={userNavItems} />
                </SidebarContent>
                <SidebarFooter />
                <SidebarRail />
            </Sidebar>
        );
    }

```

Adicionando tema escuro no layout

```tsx
    // components/theme-provider.tsx

    'use client';

    import * as React from 'react';
    import { ThemeProvider as NextThemesProvider } from 'next-themes';

    export function ThemeProvider({
        children,
        ...props
    }: React.ComponentProps<typeof NextThemesProvider>) {
        return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
    }

```

```tsx
    // app/layout.tsx

    import type { Metadata } from "next";
    import { Geist, Geist_Mono } from "next/font/google";
    import "./globals.css";
    import { ThemeProvider } from "@/components/theme-provider";

    const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
    });

    const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
    });

    export const metadata: Metadata = {
    title: "Create Next App",
    description: "Generated by create next app",
    };

    export default function RootLayout({
    children,
    }: Readonly<{
    children: React.ReactNode;
    }>) {
        return (
            <html lang="en" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
                >
                {children}
                </ThemeProvider>
            </body>
            </html>
        );
    }

```