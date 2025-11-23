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

```

