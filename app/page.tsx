import HomeMainComponent from '@/_components/home-main';
import { buttonVariants } from '@/_components/ui/button';
import { getSession } from '@/_lib/session';
import { cn } from '@/_lib/utils';
import Link from 'next/link';

export default async function HomePage() {
  const session = await getSession();
  return (
    <div className="flex flex-col min-h-screen items-center bg-zinc-50 font-sans dark:bg-black">
      <header className="flex justify-end gap-2 w-full max-w-3xl px-1 py-2.5 bg-white dark:bg-black">
        {session ? (
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Dashboard
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Log in
            </Link>
            <Link
              href="/register"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Sign up
            </Link>
          </>
        )}
      </header>
      <HomeMainComponent />
    </div>
  );
}
