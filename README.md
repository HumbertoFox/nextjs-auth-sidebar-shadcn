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

---

### ✅ 📘 Modelo do Banco de Dados — Users & Verification Tokens

📌 Visão Geral

O banco possui:

Um ENUM para papéis de usuário (ADMIN, USER)

Uma tabela principal users

Uma tabela auxiliar verification_tokens

Um trigger que atualiza automaticamente updated_at em users

### 📊 Modelo Entidade-Relacionamento (ER)

```scss

┌────────────────┐             ┌───────────────────────────┐
│     users      │             │    verification_tokens    │
├────────────────┤             ├───────────────────────────┤
│ id (PK)        │             │ identifier (PK) [email]   │
│ name           │             │ token (PK)                │
│ email (U)      │<────────────| logical relation          │
│ password       │             │ expires_at                │
│ role (ENUM)    │             └───────────────────────────┘
│ email_verified │
│ avatar         │
│ deleted_at     │
│ created_at     │
│ updated_at     │
└────────────────┘

```

### 📑 Descrição das Tabelas

### 🧍 users

|Campo	        | Tipo	      | Descrição
|---------------|-------------|---------------------------------|
|id	            | UUID (PK)   | Identificador único do usuário  |
|name	        | TEXT	      | Nome do usuário                 |
|email	        | TEXT UNIQUE | E-mail único                    |
|password       | TEXT	      | Senha hash                      |
|role	        | user_role   | Papel do usuário (ADMIN / USER) |
|email_verified | TIMESTAMPTZ | Data da verificação do e-mail   |
|avatar	        | TEXT	      | URL do avatar                   |
|deleted_at	    | TIMESTAMPTZ | Soft delete                     |
|created_at	    | TIMESTAMPTZ | Data de criação                 |
|updated_at	    | TIMESTAMPTZ | Última atualização              |

<strong>Trigger automático</strong>

Sempre que um usuário for atualizado, updated_at recebe o timestamp atual.

### 🔐 verification_tokens

Usada para login mágico, verificação de e-mail, etc.

|Campo      | Tipo	      | Descrição                       |
|-----------|-------------|---------------------------------|
|identifier | TEXT        | Email usado para verificação    |
|token      | TEXT        | Token único de autenticação     |
|expires_at | TIMESTAMPTZ | Data/hora de expiração do token |

<strong>PK composta</strong>: (identifier, token)

---

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

Libs Usadas...

```bash

    npx shadcn@latest add sidebar
    npx shadcn@latest add dialog
    npx shadcn@latest add dropdown-menu
    npx shadcn@latest add avatar
    npx shadcn@latest add breadcrumb
    npm install @headlessui/react
    npm install next-themes
    npm install @next/env
    npm install bcrypt-ts
    npm install jose
    npm install zod
    npm install pg
    npm install @types/pg
    npm install gsap

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

Adicionando o botão Nav de usuário

```tsx
    // components/nav-user.tsx

    'use client';

    import { ChevronsUpDown, } from 'lucide-react';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, } from '@/components/ui/dropdown-menu';
    import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar, } from '@/components/ui/sidebar';
    import { UserInfo } from '@/components/user-info';
    import { UserMenuContent } from '@/components/user-menu-content';

    type UserProps = {
        name: string;
        email: string;
        avatar?: string;
    };

    type UserTypeProps = {
        user: UserProps;
    };

    export function NavUser({ user, }: UserTypeProps) {
        const { isMobile } = useSidebar();
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            >
                                <UserInfo user={user} />
                                <ChevronsUpDown className="ml-auto size-4" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                            side={isMobile ? "bottom" : "right"}
                            align="end"
                            sideOffset={4}
                        >
                            <UserMenuContent user={user} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
        );
    }

```

Componente de exibição de informações do usuário

```tsx
    // components/user-info.tsx

    'use client';

    import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
    import { useInitials } from '@/hooks/use-initials';

    type UserProps = {
        name: string;
        email: string;
        avatar?: string;
    };

    type UserTypeProps = {
        user: UserProps;
        showEmail?: boolean;
    };

    export function UserInfo({ user, showEmail = false }: UserTypeProps) {
        const getInitials = useInitials();
        return (
            <>
                <Avatar className="size-8 overflow-hidden rounded-full">
                    {user.avatar ? (
                        <AvatarImage src={user.avatar} alt={user.name} />
                    ) : (
                        <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                            {getInitials(user.name)}
                        </AvatarFallback>
                    )}
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    {showEmail && <span className="text-muted-foreground truncate text-xs">{user.email}</span>}
                </div>
            </>
        );
    }

```

Componente para exibir menu do usuário e links sair e configuração

```tsx
    // components/user-manu-content.tsx

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

```

Adicionando usruário Fixo para exemplo sem passar Avatar

```tsx

    import DashboardSidebar from '@/components/dashboard-sidebar';
    import { SidebarInset, SidebarProvider, } from '@/components/ui/sidebar';

    const user = {
        name: "shadcn Ui",
        email: "shadcn.ui@example.com",
    };

    export default function DashboardLayout({
        children
    }: Readonly<{
        children: React.ReactNode;
    }>) {
        return (
            <SidebarProvider>
                <DashboardSidebar user={user} />
                <SidebarInset>
                    {children}
                </SidebarInset>
            </SidebarProvider>
        );
    }

```

```tsx
    // app/dashboard/settings/layout.tsx

    import Heading from '@/components/heading';
    import SettingsLayoutComponents from '@/components/settings-layout';
    import { Separator } from '@/components/ui/separator';
    import { type PropsWithChildren } from 'react';

    export default function SettingsLayout({ children }: PropsWithChildren) {
        return (
            <>
                <Heading
                    title="Configurações"
                    description="Gerencie seu perfil e as configurações da conta"
                />

                <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12 px-4">
                    <SettingsLayoutComponents />

                    <Separator className="my-6 md:hidden" />

                    <div className="flex-1 md:max-w-2xl">
                        <section className="max-w-xl space-y-12">{children}</section>
                    </div>
                </div>
            </>
        );
    }

```

```tsx
    // components/settings-layout.tsx

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

```

```tsx
    // components/heading.tsx

    'use client';

    import { DashboardSidebarHeader } from '@/components/dashboard-sidebar-header';
    import { usePathname } from 'next/navigation';

    type HeadingProps = {
        title: string;
        description?: string;
    }

    type BreadcrumbItemType = {
        text: string;
        href?: string;
    }

    export default function Heading({ title, description }: HeadingProps) {
        const currentPath = usePathname();
        const breadcrumbMap: Record<string, BreadcrumbItemType[]> = {
            '/dashboard/settings': [
                { text: 'Dashboard', href: '/dashboard' },
                { text: 'Settings' },
            ],
            '/dashboard/settings/profile': [
                { text: 'Dashboard', href: '/dashboard' },
                { text: 'Settings', href: '/dashboard/settings' },
                { text: 'Profile' },
            ],
            '/dashboard/settings/password': [
                { text: 'Dashboard', href: '/dashboard' },
                { text: 'Settings', href: '/dashboard/settings' },
                { text: 'Password' },
            ],
            '/dashboard/settings/appearance': [
                { text: 'Dashboard', href: '/dashboard' },
                { text: 'Settings', href: '/dashboard/settings' },
                { text: 'Appearance' },
            ],
        };
        const breadcrumbItems = breadcrumbMap[currentPath] || [];

        return (
            <>
                <DashboardSidebarHeader items={breadcrumbItems} />
                <div className="mb-8 my-1 px-4 space-y-0.5">
                    <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
                    {description && <p className="text-muted-foreground text-sm">{description}</p>}
                </div>
            </>
        );
    }

```

```tsx
    // app/dashboard/settings/page.tsx

    import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
    import { useInitials } from '@/hooks/use-initials';
    import { BadgeAlert, BadgeCheck } from 'lucide-react';

    const user = {
        id: "cmikxiu3g0101m4ij3ab6f7pha",
        name: "shadcn Ui",
        email: "shadcn.ui@example.com",
        avatar: null,
        role: "ADMIN",
        email_verified: null,
        created_at: new Date(),
        updated_at: new Date(),
    };

    export default function SettingsPage() {
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
                        <span className="font-extralight font-pirata text-3xl"><strong>{user.name}</strong></span>
                        <span className="text-muted-foreground truncate text-sm gap-x-1.5 inline-flex">
                            {user.email}
                            {user.email_verified
                                ? <BadgeCheck className="text-green-500" />
                                : <BadgeAlert className="text-orange-500" />
                            }
                        </span>
                        <div>
                            <strong>Tipo de Conta : </strong>
                            <span className={`font-pirata
                            ${user.role === 'ADMIN'
                                    ? 'text-blue-800'
                                    : 'text-green-800'
                                }`}>
                                {user.role}
                            </span>
                        </div>
                    </div>
                </div>
                <div>
                    <strong>Usuário criado em : </strong><span>{user.created_at.toLocaleDateString("pt-BR")}</span>
                </div>
                <div>
                    <strong>Usuário atualizado em : </strong><span>{user.updated_at.toLocaleDateString("pt-BR")}</span>
                </div>
            </>
        );
    }

```

## 📦 Configuração do Banco de Dados (PostgreSQL)

Este endpoint realiza automaticamente a configuração inicial do banco de dados, criando tipos, tabelas, funções e triggers necessários para o sistema de autenticação e gerenciamento de usuários.

Abaixo estão descritas todas as queries, com explicações detalhadas.

### 🧩 1. Criação do ENUM user_role

```sql

    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_type WHERE typname = 'user_role'
        ) THEN
            CREATE TYPE user_role AS ENUM ('ADMIN', 'USER');
        END IF;
    END$$;

```

### 🔍 Explicação

Cria um tipo ENUM chamado user_role, utilizado para representar o papel do usuário dentro do sistema.

Valores possíveis:

- ADMIN

- USER

O bloco IF NOT EXISTS garante que o tipo não seja recriado caso já exista no banco.

### 👤 2. Criação da tabela users

```sql

    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role user_role NOT NULL DEFAULT 'USER',
        email_verified TIMESTAMP NULL,
        avatar TEXT NULL,
        deleted_at TIMESTAMP NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

```

### 🔍 Explicação

Cria a tabela principal de usuários com os seguintes campos:

| Campo            | Tipo        | Descrição                    |
| ---------------- | ----------- | ---------------------------- |
| `id`             | TEXT        | ID único do usuário          |
| `name`           | TEXT        | Nome completo                |
| `email`          | TEXT UNIQUE | Email único                  |
| `password`       | TEXT        | Hash da senha                |
| `role`           | user_role   | Enum com `ADMIN` ou `USER`   |
| `email_verified` | TIMESTAMP   | Data de verificação do email |
| `avatar`         | TEXT        | URL da imagem de perfil      |
| `deleted_at`     | TIMESTAMP   | Soft delete                  |
| `created_at`     | TIMESTAMP   | Data de criação              |
| `updated_at`     | TIMESTAMP   | Última atualização           |


IF NOT EXISTS impede erros caso a tabela já exista.

### 🔄 3. Função para atualizar updated_at

```sql

    CREATE OR REPLACE FUNCTION update_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

```

### 🔍 Explicação

Cria uma função Trigger que:

Atualiza automaticamente o campo updated_at

É executada sempre que um registro da tabela users for atualizado

Isso mantém o controle automático de timestamps sem depender da aplicação.

### ⏱ 4. Trigger para atualizar updated_at automaticamente

```sql

    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1
            FROM pg_trigger
            WHERE tgname = 'trigger_update_users_updated_at'
        ) THEN
            CREATE TRIGGER trigger_update_users_updated_at
            BEFORE UPDATE ON users
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at();
        END IF;
    END$$;

```

### 🔍 Explicação

Cria o trigger trigger_update_users_updated_at, que executa:

Antes de qualquer UPDATE

Na tabela users

Chamando a função update_updated_at()

Assim, updated_at é sempre atualizado automaticamente — sem necessidade de alterar manualmente na aplicação.

### 🔐 5. Criação da tabela verification_tokens

```sql

    CREATE TABLE IF NOT EXISTS verification_tokens (
        identifier TEXT NOT NULL,
        token TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        PRIMARY KEY (identifier, token)
    );

```

### 🔍 Explicação

Essa tabela armazena tokens de verificação, utilizados para:

- Verificação de email

- Reset de senha

- Fluxos temporários de autenticação

A chave primária é composta por (identifier, token), permitindo:

- Unicidade por par identificador + token

- A mesma pessoa pode ter múltiplos tokens válidos simultaneamente

### ✅ Resultado Final

Após a execução de todas as queries acima:

- ✔ Tipo ENUM user_role criado (ADMIN / USER)
- ✔ Tabela users pronta com controle automático de timestamps
- ✔ Trigger configurado para atualizar updated_at
- ✔ Tabela verification_tokens criada
- ✔ Banco preparado para autenticação, roles e tokens

## 🔍 O que este diagrama mostra?

### 🧩 ENUMS

`USER_ROLE`

`ADMIN` 🛠️

`USER` 👤

### 👤 Tabela `USERS`

- Campos básicos de usuário

- Controle automático de timestamps

- Soft delete (`deleted_at`)

- `ENUM` `role` ligado visualmente à entidade `USER_ROLE`

### 🔐 Tabela VERIFICATION_TOKENS

- Tokens vinculados por `identifier → email`

- PK composta (`identifier`, `token`)

- Usada para verificação de email, reset de senha, MFA etc.

### 🔗 Relacionamentos

- USERS → VERIFICATION_TOKENS (`email → identifier`)

- USERS → USER_ROLE (`role → enum`)