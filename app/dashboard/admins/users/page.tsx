import { DashboardSidebarHeader } from '@/_components/dashboard-sidebar-header';
import { Button } from '@/_components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/_components/ui/dialog';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/_components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/_components/ui/table';
import getVisiblePagination from '@/_lib/getvisiblepagination';
import { UserRepository } from '@/_lib/userrepository';
import { deleteUserById } from '@/app/api/actions/deleteadminuser';
import { reactivateAdminUserById } from '@/app/api/actions/reactivateadminuser';
import { UserLock, UserPen, UserX } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

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
                                                            After confirmation, user {user.name} will no longer be able to access the system!
                                                        </DialogDescription>
                                                        <DialogFooter>
                                                            <DialogClose asChild>
                                                                <Button
                                                                    type="button"
                                                                    variant="secondary"
                                                                >
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
                                            <Dialog key={user.email}>
                                                <DialogTrigger asChild>
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
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogTitle>
                                                        Are you sure?
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                        After confirmation, you will activate the user account {user.name}!
                                                    </DialogDescription>
                                                    <DialogFooter>
                                                        <DialogClose asChild>
                                                            <Button
                                                                type="button"
                                                                variant="destructive"
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </DialogClose>
                                                        <form action={reactivateAdminUserById}>
                                                            <input
                                                                type="hidden"
                                                                name="userId"
                                                                value={user.id}
                                                            />
                                                            <Button
                                                                type="submit"
                                                                variant="outline"
                                                            >
                                                                Yes, activate!
                                                            </Button>
                                                        </form>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
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