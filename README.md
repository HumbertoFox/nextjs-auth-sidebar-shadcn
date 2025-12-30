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

### ✅ 📘 Modelo do Banco de Dados - `Users` & `Verification Tokens`

### 📌 Visão Geral

- O banco de dados é composto por:

- Um ENUM para definição de papéis de usuário (`ADMIN`, `USER`)

- Uma tabela principal: `users`

- Uma tabela auxiliar: `verification_tokens`

- Um trigger que atualiza automaticamente o campo `updated_at` na tabela `users`

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

### 📌 Observação:

A relação entre `users.email` e `verification_tokens.identifier` é <strong>lógica</strong>, não existindo uma foreign key explícita.
Isso permite a criação de tokens antes da existência do usuário (ex.: verificação de e-mail ou login mágico).

---

### 🔖 ENUMs

### 🏷️ `user_role`

```sql

    CREATE TYPE user_role AS ENUM ('ADMIN', 'USER');

```

| Valor | Descrição             |
|-------|-----------------------|
| ADMIN | Usuário administrador |
| USER  | Usuário padrão        |

<strong>Uso:</strong>

aplicado no campo `users.role` para garantir integridade semântica de papéis.

### 📑 Descrição das Tabelas

### 🧍 users

```sql

    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    CREATE EXTENSION IF NOT EXISTS "citext";

    CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email CITEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role user_role NOT NULL DEFAULT 'USER',
        email_verified TIMESTAMPTZ NULL,
        avatar TEXT NULL,
        deleted_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

```

| Campo	         | Tipo	         | Descrição                                   |
|----------------|---------------|---------------------------------------------|
| id             | UUID (PK)     | Identificador único do usuário              |
| name	         | TEXT          | Nome do usuário                             |
| email	         | CITEXT UNIQUE | E-mail único (case-insensitive)             |
| password       | TEXT	         | Hash da senha (`NULL` permite login mágico) |
| role	         | user_role     | Papel do usuário (`ADMIN` / `USER`)         |
| email_verified | TIMESTAMPTZ   | Data da verificação do e-mail               |
| avatar         | TEXT	         | URL do avatar                               |
| deleted_at     | TIMESTAMPTZ   | Soft delete                                 |
| created_at     | TIMESTAMPTZ   | Data de criação                             |
| updated_at     | TIMESTAMPTZ   | Última atualização                          |

### 🔁 Trigger automático

```sql

    CREATE OR REPLACE FUNCTION update_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER trigger_update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

```

Atualiza `updated_at` automaticamente em qualquer alteração da tabela.

### 🔐 verification_tokens

```sql

    CREATE TABLE IF NOT EXISTS verification_tokens (
        identifier CITEXT NOT NULL,
        token TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        PRIMARY KEY (identifier, token)
    );

```

Tabela utilizada para <strong>login mágico</strong>, <strong>verificação de e-mail</strong> e outros fluxos de autenticação.

| Campo      | Tipo	       | Descrição                       |
|------------|-------------|---------------------------------|
| identifier | CITEXT      | Email usado para verificação    |
| token      | TEXT        | Token único de autenticação     |
| expires_at | TIMESTAMPTZ | Data/hora de expiração do token |

- <strong>Chave primária composta:</strong> `(identifier, token)`
- <strong>Mantém integridade mesmo antes do usuário existir</strong>

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

```json

    "dependencies": {
        "@headlessui/react": "^2.2.9",
        "@next/env": "^16.1.0",
        "@radix-ui/react-avatar": "^1.1.11",
        "@radix-ui/react-dialog": "^1.1.15",
        "@radix-ui/react-dropdown-menu": "^2.1.16",
        "@radix-ui/react-label": "^2.1.8",
        "@radix-ui/react-select": "^2.2.6",
        "@radix-ui/react-separator": "^1.1.8",
        "@radix-ui/react-slot": "^1.2.4",
        "@radix-ui/react-tooltip": "^1.2.8",
        "@types/nodemailer": "^7.0.4",
        "@vercel/blob": "^2.0.0",
        "bcrypt-ts": "^8.0.0",
        "class-variance-authority": "^0.7.1",
        "clsx": "^2.1.1",
        "gsap": "^3.14.2",
        "jose": "^6.1.3",
        "lucide-react": "^0.562.0",
        "next": "16.1.0",
        "next-themes": "^0.4.6",
        "nodemailer": "^7.0.11",
        "pg": "^8.16.3",
        "react": "19.2.3",
        "react-dom": "19.2.3",
        "tailwind-merge": "^3.4.0",
        "zod": "^4.2.1"
    },
    "devDependencies": {
        "@tailwindcss/postcss": "^4",
        "@types/node": "^25",
        "@types/pg": "^8.16.0",
        "@types/react": "^19",
        "@types/react-dom": "^19",
        "eslint": "^9",
        "eslint-config-next": "16.1.0",
        "tailwindcss": "^4",
        "tw-animate-css": "^1.4.0",
        "typescript": "^5"
    }

```

Criando componente sidebar `_components/dashboard-sidebar.tsx`

```bash

    touch _components/dashboard-sidebar.tsx

```

Editando layout para rederizar dashboard sidebar no layout

```tsx
    // app/dashboard/layout.tsx

    export default async function DashboardLayout({
        children,
    }: Readonly<{
        children: React.ReactNode;
    }>) {
        const user = await getUser() as UserDetailsProps;
        const isAdmin = user.role === 'ADMIN';
        return (
            <SidebarProvider>
                <DashboardSidebar
                    user={user}
                    isAdmin={isAdmin}
                />
                <SidebarInset>
                    {children}
                </SidebarInset>
            </SidebarProvider>
        );
    }

```

Logo svg do next <a href="https://devicon.dev/">DEVICON</a> icons

```tsx
    // _components/app-logo-icon-svg.tsx

    'use client';

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
    // _components/app-logo-svg.tsx

    'use client';

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

```tsx
    // _components/dashboard-sidebar.tsx

    'use client';

    type DashboardSidebarProps = React.ComponentProps<typeof Sidebar> & {
        user: ProfileForm;
        isAdmin: boolean;
    }

    export default function DashboardSidebar({
        user,
        isAdmin,
        ...props
    }: DashboardSidebarProps) {
        const adminNavItems: NavMainItemProps[] = [
            { title: 'Admins', href: '/dashboard/admins', icon: UserRoundCog },
            { title: 'Users', href: '/dashboard/admins/users', icon: UsersRound },
            { title: 'Register User', href: '/dashboard/admins/register', icon: UserRoundPlus },
        ];
        const userNavItems: NavMainItemProps[] = [
            { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid, },
        ];
        return (
            <Sidebar collapsible="icon" variant="floating" {...props}>
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link href="/dashboard" prefetch>
                                    <AppLogoSvg />
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>
                {isAdmin && (
                    <SidebarContent>
                        <NavMainAdmins items={adminNavItems} />
                    </SidebarContent>
                )}
                <SidebarContent>
                    <NavMainUsers items={userNavItems} />
                </SidebarContent>
                <SidebarFooter>
                    <NavUser user={user} />
                </SidebarFooter>
                <SidebarRail />
            </Sidebar>
        );
    }

```

Página dashboard

```tsx
    // app/dashboard/page.tsx

    export const generateMetadata = async (): Promise<Metadata> => {
        return {
            title: 'Dashboard'
        };
    }

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

    export function DashboardSidebarHeader({
        items,
    }: DashboardSidebarHeaderProps) {
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

    export const generateMetadata = async (): Promise<Metadata> => {
        return {
            title: 'Administrators'
        };
    }

    export default async function AdminsPage() {
        const user = await getUser() as UserDetailsProps;
        const loggedAdmin = user.id;
        const admins = await UserRepository.findAllAdmins();
        const breadcrumbItems = [
            { text: 'Dashboard', href: '/dashboard' },
            { text: 'Admins' },
        ];
        return (
            <>
                <DashboardSidebarHeader items={breadcrumbItems} />
                <div className="flex flex-1 flex-col gap-4 p-4">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-screen flex-1 overflow-hidden rounded-xl border md:min-h-min">
                        <Table className="w-full text-center">
                            <TableHeader>
                                <TableRow className="cursor-default">
                                    <TableHead className="text-center">No.</TableHead>
                                    <TableHead className="text-center max-lg:hidden">Code.</TableHead>
                                    <TableHead className="text-center max-lg:hidden">Name</TableHead>
                                    <TableHead className="text-center">E-mail</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {admins.length === 0 && (
                                    <TableRow className="text-red-600 cursor-default">
                                        <TableCell colSpan={5}>There are no other administrators.</TableCell>
                                    </TableRow>
                                )}
                                {admins.map((admin, index) => (
                                    <TableRow key={index} className="cursor-default">
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell className="max-lg:hidden">{admin.id}</TableCell>
                                        <TableCell className="max-lg:hidden">{admin.name}</TableCell>
                                        <TableCell>{admin.email}</TableCell>
                                        <TableCell className="flex justify-evenly items-center my-1">
                                            {!admin.deleted_at ? (
                                                <>
                                                    <Link
                                                        href={admin.id === loggedAdmin ? '/dashboard/settings/profile' : `/dashboard/admins/${admin.id}/update`}
                                                        title={`Atualizar ${admin.name}`}
                                                    >
                                                        <UserRoundPen
                                                            aria-label={`To update ${admin.name}`}
                                                            className="size-6 text-yellow-600 hover:text-yellow-500 duration-300"
                                                        />
                                                    </Link>

                                                    <Dialog key={admin.id}>
                                                        <DialogTrigger asChild>
                                                            {admin.id !== loggedAdmin && (
                                                                <button
                                                                    type="button"
                                                                    title={`Delete ${admin.name}`}
                                                                >
                                                                    <UserRoundX
                                                                        aria-label={`Delete ${admin.name}`}
                                                                        className="size-6 text-red-600 cursor-pointer hover:text-red-500 duration-300"
                                                                    />
                                                                </button>
                                                            )}
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogTitle>
                                                                Are you sure?
                                                            </DialogTitle>
                                                            <DialogDescription>
                                                                Once you confirm, you will not be able to reverse this action!
                                                            </DialogDescription>
                                                            <DialogFooter>
                                                                <DialogClose asChild>
                                                                    <Button type="button" variant="secondary">
                                                                        Cancel
                                                                    </Button>
                                                                </DialogClose>
                                                                <form action={deleteUserById}>
                                                                    <input type="hidden" name="userId" value={admin.id} />
                                                                    <Button
                                                                        type="submit"
                                                                        variant="destructive"
                                                                    >
                                                                        Yes, delete!
                                                                    </Button>
                                                                </form>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                </>
                                            ) : (
                                                <form action={reactivateAdminUserById}>
                                                    <input
                                                        type="hidden"
                                                        name="userId"
                                                        value={admin.id}
                                                    />
                                                    <button
                                                        type="submit"
                                                        title={`Activate ${admin.name}`}
                                                        className="cursor-pointer"
                                                    >
                                                        <UserLock
                                                            aria-label={`Activate ${admin.name}`}
                                                            className="size-6 text-red-600 hover:text-green-500 duration-300"
                                                        />
                                                    </button>
                                                </form>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </>
        );
    }

```

```tsx
    // app/dashboard/admins/users/page.tsx

    export const generateMetadata = async (): Promise<Metadata> => {
        return {
            title: 'Users'
        };
    }

    const pageSize = 10;

    export default async function UsersPage(props: { searchParams?: Promise<{ page?: number; }>; }) {
        const params = await props.searchParams;
        const rawPage = parseInt(String(params?.page ?? '1'), 10);
        const currentPage = Number.isNaN(rawPage) ? 1 : Math.max(1, rawPage);
        const [users, total] = await UserRepository.findUsersPaginated(currentPage, pageSize);
        const totalPages = Math.ceil(total / pageSize);
        const breadcrumbItems = [
            { text: 'Dashboard', href: '/dashboard' },
            { text: 'Admins', href: '/dashboard/admins' },
            { text: 'Users', },
        ];
        return (
            <>
                <DashboardSidebarHeader items={breadcrumbItems} />
                <div className="flex flex-1 flex-col gap-4 p-4">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-screen flex-1 overflow-hidden rounded-xl border md:min-h-min">
                        <Table className="w-full text-center">
                            <TableHeader>
                                <TableRow className="cursor-default">
                                    <TableHead className="text-center">No.</TableHead>
                                    <TableHead className="text-center max-lg:hidden">Code.</TableHead>
                                    <TableHead className="text-center max-lg:hidden">Name</TableHead>
                                    <TableHead className="text-center">E-mail</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.length === 0 && (
                                    <TableRow className="text-red-600 cursor-default">
                                        <TableCell colSpan={5}>There are no registered users.</TableCell>
                                    </TableRow>
                                )}
                                {users.map((user, index) => (
                                    <TableRow key={user.id} className="cursor-default">
                                        <TableCell>{(currentPage - 1) * 10 + index + 1}</TableCell>
                                        <TableCell className="max-lg:hidden">{user.id}</TableCell>
                                        <TableCell className="max-lg:hidden">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell className="flex justify-evenly items-center my-1">
                                            {!user.deleted_at ? (
                                                <>
                                                    <Link
                                                        href={`/dashboard/admins/${user.id}/update`}
                                                        title={`To update ${user.name}`}
                                                    >
                                                        <UserPen
                                                            aria-label={`To update ${user.name}`}
                                                            className="size-6 text-yellow-600 hover:text-yellow-500 duration-300"
                                                        />
                                                    </Link>

                                                    <Dialog key={user.id}>
                                                        <DialogTrigger asChild>
                                                            <button
                                                                type="button"
                                                                title={`Delete ${user.name}`}
                                                            >
                                                                <UserX
                                                                    aria-label={`Delete ${user.name}`}
                                                                    className="size-6 text-red-600 cursor-pointer hover:text-red-500 duration-300"
                                                                />
                                                            </button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogTitle>
                                                                Are you sure?
                                                            </DialogTitle>
                                                            <DialogDescription>
                                                                Once you confirm, you will not be able to reverse this action!
                                                            </DialogDescription>
                                                            <DialogFooter>
                                                                <DialogClose asChild>
                                                                    <Button type="button" variant="secondary">
                                                                        Cancel
                                                                    </Button>
                                                                </DialogClose>
                                                                <form action={deleteUserById}>
                                                                    <input
                                                                        type="hidden"
                                                                        name="userId"
                                                                        value={user.id}
                                                                    />
                                                                    <Button
                                                                        type="submit"
                                                                        variant="destructive"
                                                                    >
                                                                        Yes, delete!
                                                                    </Button>
                                                                </form>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                </>
                                            ) : (
                                                <form action={reactivateAdminUserById}>
                                                    <input
                                                        type="hidden"
                                                        name="userId"
                                                        value={user.id}
                                                    />
                                                    <button
                                                        type="submit"
                                                        title={`Ativar ${user.name}`}
                                                        className="cursor-pointer"
                                                    >
                                                        <UserLock
                                                            aria-label={`Arivar ${user.name}`}
                                                            className="size-6 text-red-600 hover:text-green-500 duration-300"
                                                        />
                                                    </button>
                                                </form>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    {totalPages > 1 && (
                        <Pagination className="pb-2.5">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href={currentPage > 1 ? `?page=${currentPage - 1}` : '#'}
                                        aria-disabled={currentPage <= 1}
                                        className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                                    />
                                </PaginationItem>
                                {getVisiblePagination(currentPage, totalPages).map((page, index) => (
                                    <PaginationItem key={index}>
                                        {page === '...' ? (
                                            <PaginationLink
                                                href="#"
                                                aria-disabled
                                                className="pointer-events-none opacity-50"
                                            >
                                                ...
                                            </PaginationLink>
                                        ) : (
                                            <PaginationLink
                                                href={`?page=${page}`}
                                                isActive={currentPage === page}
                                            >
                                                {page}
                                            </PaginationLink>
                                        )}
                                    </PaginationItem>
                                ))}
                                <PaginationItem>
                                    <PaginationNext
                                        href={currentPage < totalPages ? `?page=${currentPage + 1}` : '#'}
                                        aria-disabled={currentPage >= totalPages}
                                        className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )}
                </div>
            </>
        );
    }

```

```tsx
    // app/dashboard/admins/register/page.tsx

    export const generateMetadata = async (): Promise<Metadata> => {
        return {
            title: 'Register User'
        };
    }

    export default function RegisterUsersPage() {
        const breadcrumbItems = [
            { text: 'Dashboard', href: '/dashboard' },
            { text: 'Admins', href: '/dashboard/admins' },
            { text: 'Register', },
        ];
        return (
            <>
                <DashboardSidebarHeader items={breadcrumbItems} />
                <RegisterUser
                    titleForm="Register User Acount"
                    valueButton="Register"
                />
            </>
        );
    }

```

Adicionando tema escuro no layout

```tsx
    // _components/theme-provider.tsx

    'use client';

    export function ThemeProvider({
        children,
        ...props
    }: React.ComponentProps<typeof NextThemesProvider>) {
        return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
    }

```

```tsx
    // app/layout.tsx

    const geistSans = Geist({
      variable: "--font-geist-sans",
      subsets: ["latin"],
    });

    const geistMono = Geist_Mono({
      variable: "--font-geist-mono",
      subsets: ["latin"],
    });

    const pirataOne = Pirata_One({
      variable: "--font-pirata-one",
      weight: "400",
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
            className={`${geistSans.variable} ${geistMono.variable} ${pirataOne.variable} antialiased`}
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
    // _components/nav-user.tsx

    'use client';

    export function NavUser({
        user,
    }: UserComponentProps) {
        const { isMobile } = useSidebar();
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
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
    // _components/user-info.tsx

    'use client';

    export function UserInfo({
        user,
        showEmail = false,
    }: UserInfoProps) {
        const getInitials = useInitials();
        return (
            <>
                <Avatar className="overflow-hidden rounded-full">
                    {user.avatar ? (
                        <AvatarImage
                            src={user.avatar}
                            alt={user.name}
                        />
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

    export function UserMenuContent({
        user,
    }: UserComponentProps) {
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
                            href="/dashboard/settings"
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

```tsx
    // app/dashboard/settings/layout.tsx

    export default function SettingsLayout({
        children,
    }: PropsWithChildren) {
        return (
            <>
                <Heading
                    title="Settings"
                    description="Manage your profile and account settings."
                />
                <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12 px-4">
                    <SettingsLayoutComponents />
                    <Separator className="my-6 md:hidden" />
                    <div className="flex-1 md:max-w-2xl">
                        <section className="max-w-xl flex flex-col gap-4 p-4">
                            {children}
                        </section>
                    </div>
                </div>
            </>
        );
    }

```

```tsx
    // _components/settings-layout.tsx

    'use client';

    export default function SettingsLayoutComponents() {
        const currentPath = usePathname();
        const sidebarNavItems: SidebarNavItemProps[] = [
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
    // _components/heading.tsx

    'use client';

    export default function Heading({
        title,
        description,
    }: HeadingProps) {
        const currentPath = usePathname();
        const breadcrumbMap: Record<string, BreadcrumbItemProps[]> = {
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

    export const generateMetadata = async (): Promise<Metadata> => {
        return {
            title: 'Settings'
        };
    }

    export default async function SettingsPage() {
        const user = await getUser() as UserDetailsProps;
        return (
            <SettingsPageClient user={user} />
        );
    }

```

```tsx
    // app/dashboard/settings/settings-client.tsx

    'use client';

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

```

Registrando o primeiro Usuário sempre será `ADMIN`

```tsx
    // app/register/page.tsx

    export const generateMetadata = async (): Promise<Metadata> => {
      const isAdmin = await getIsAdmin();
      return {
        title: isAdmin ? 'Register User' : 'Register Administrator'
      };
    }
    
    export default async function RegisterPage() {
      const isAdmin = await getIsAdmin();
      const Title = isAdmin ? 'Register User' : 'Register Administrator';
      return (
        <Suspense fallback={<LoadingRegister />}>
          <RegisterAdmin TitleIntl={Title} />
        </Suspense>
      );
    }

```

Componente `form` page client

```tsx
    // app/register/form-register-admin.tsx

    'use client';

    export default function RegisterAdmin({
        TitleIntl,
    }: { TitleIntl: string }) {
        const emailRef = useRef<HTMLInputElement>(null);
        const router = useRouter();
        const [state, action, pending] = useActionState(createAdmin, undefined);
        const [imagePreview, setImagePreview] = useState<string | null>(null);
        const [imageFile, setImageFile] = useState<File | null>(null);
        const [imageError, setImageError] = useState<string | null>(null);
        const [showPassword, setShowPassword] = useState<boolean>(false);
        const [showPasswordConfirm, setShowPasswordConfirm] = useState<boolean>(false);
        const [data, setData] = useState<RegisterFormProps>({
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
            avatar: undefined,
        });

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const { id, value } = e.target;
            setData({ ...data, [id]: value });
        };
        const onImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
            const { file, preview, error } = await handleImageChange(e);
            setImageFile(file);
            setImagePreview(preview);
            setImageError(error);
        };
        const toggleShowPassword = () => setShowPassword(prev => !prev);
        const toggleShowPasswordConfirm = () => setShowPasswordConfirm(prev => !prev);
        const submit = async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            if (imageError) return;
            const formData = new FormData(e.currentTarget);
            if (imageFile) formData.append('file', imageFile);
            startTransition(() => action(formData));
        };
        useEffect(() => {
            if (!state?.message) return;

            startTransition(() => {
                setData({
                    name: '',
                    email: '',
                    password: '',
                    password_confirmation: '',
                    avatar: undefined,
                });
            });
            router.push('/dashboard');
        }, [state, router]);
        return (
            <div className="space-y-6">
                <div className="flex flex-col items-center gap-2 text-center mx-auto">
                    <h1 className="text-xl font-medium">{TitleIntl}</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Enter your details below to create your account.
                    </p>
                </div>
                <form
                    onSubmit={submit}
                    className="flex flex-col gap-6 mx-auto"
                >
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <Label
                                htmlFor="file"
                                className="mx-auto"
                            >
                                Profile picture
                            </Label>
                            <div className="flex flex-col items-center gap-3">
                                <div className="relative w-24 h-24 rounded-full overflow-hidden border border-gray-300">
                                    {imagePreview ? (
                                        <Image
                                            src={imagePreview}
                                            alt="Preview"
                                            width={512}
                                            height={512}
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-sm text-gray-400 bg-gray-50">
                                            No image
                                        </div>
                                    )}
                                </div>

                                <Label
                                    htmlFor="file"
                                    title={imageError ? "Click on Select image and then Cancel." : "Select profile picture"}
                                    className="cursor-pointer px-3 py-1 text-sm border rounded-md hover:bg-gray-50"
                                >
                                    Select image
                                </Label>
                                <Input
                                    id="file"
                                    name="file"
                                    type="file"
                                    tabIndex={1}
                                    accept="image/jpeg, image/png, image/webp"
                                    onChange={onImageChange}
                                    disabled={pending}
                                    className="hidden"
                                />
                                {imageError && <InputError message={imageError} />}
                                {state?.errors?.avatar?.[0] && <InputError message={state.errors.avatar[0]} />}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                required
                                autoFocus
                                tabIndex={2}
                                autoComplete="name"
                                value={data.name}
                                onChange={handleChange}
                                disabled={pending}
                                placeholder="Full name"
                            />
                            {state?.errors?.name?.[0] && <InputError message={state.errors.name[0]} />}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                ref={emailRef}
                                required
                                tabIndex={3}
                                autoComplete="email"
                                value={data.email}
                                onChange={handleChange}
                                disabled={pending}
                                placeholder="email@exemple.com"
                            />
                            {state?.errors?.email?.[0] && <InputError message={state.errors.email[0]} />}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    tabIndex={4}
                                    value={data.password}
                                    onChange={handleChange}
                                    disabled={pending}
                                    placeholder="Password"
                                />
                                <button
                                    type="button"
                                    title={showPassword ? "Hide password" : "Show password"}
                                    onClick={toggleShowPassword}
                                    className="btn-icon-toggle"
                                >
                                    {showPassword ? <Eye /> : <EyeClosed />}
                                </button>
                            </div>
                            {state?.errors?.password?.[0] && <InputError message={state.errors.password[0]} />}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">Confirm your password.</Label>
                            <div className="relative">
                                <Input
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    type={showPasswordConfirm ? "text" : "password"}
                                    required
                                    tabIndex={5}
                                    value={data.password_confirmation}
                                    onChange={handleChange}
                                    disabled={pending}
                                    placeholder="Confirm your password."
                                />
                                <button
                                    type="button"
                                    title={showPasswordConfirm ? "Hide password" : "Show password"}
                                    onClick={toggleShowPasswordConfirm}
                                    className="btn-icon-toggle"
                                >
                                    {showPasswordConfirm ? <Eye /> : <EyeClosed />}
                                </button>
                            </div>
                            {state?.errors?.password_confirmation?.[0] && <InputError message={state.errors.password_confirmation[0]} />}
                        </div>

                        <Button
                            type="submit"
                            tabIndex={6}
                            disabled={pending || Boolean(imageError)}
                            aria-busy={pending || Boolean(imageError)}
                            className="mt-2 w-full"
                        >
                            {pending && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Create an account
                        </Button>

                        <div className="text-muted-foreground text-center text-sm">
                            You already have an account!&nbsp;&nbsp;
                            <TextLink href="/login" tabIndex={7}>
                                Log in
                            </TextLink>
                        </div>
                    </div>
                </form>

                {state?.warning && <div className="mb-4 text-center text-sm font-medium text-orange-400">{state.warning}</div>}
                {state?.message && <div className="mb-4 text-center text-sm font-medium text-blue-400">Account created successfully! Redirecting to the Dashboard, please wait...</ div>}
            </div>
        );
    }

```