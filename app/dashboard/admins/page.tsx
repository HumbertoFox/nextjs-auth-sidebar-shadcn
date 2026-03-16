import { DashboardSidebarHeader } from '@/_components/dashboard-sidebar-header';
import { Button } from '@/_components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/_components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/_components/ui/table';
import { getCsrfToken } from '@/_lib/csrf';
import { getUser } from '@/_lib/dal';
import { userRepository } from '@/_lib/userrepositorys';
import { UserDetailsProps } from '@/_types';
import { deleteUserById } from '@/app/api/actions/deleteadminuser';
import { reactivateAdminUserById } from '@/app/api/actions/reactivateadminuser';
import { UserLock, UserRoundPen, UserRoundX } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const generateMetadata = async (): Promise<Metadata> => {
    return {
        title: 'Administrators'
    };
}

export default async function AdminsPage() {
    const user = await getUser() as UserDetailsProps;
    const loggedAdmin = user.id;
    const admins = await userRepository.findAllAdmins();
    const csrfToken = await getCsrfToken();
    const breadcrumbItems = [
        {
            text: 'Dashboard',
            href: '/dashboard'
        },
        {
            text: 'Admins'
        },
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
                                <TableRow key={admin.id} className="cursor-default">
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell className="max-lg:hidden">{admin.id}</TableCell>
                                    <TableCell className="max-lg:hidden">{admin.name}</TableCell>
                                    <TableCell>{admin.email}</TableCell>
                                    <TableCell className="flex justify-evenly items-center my-1">
                                        {!admin.deleted_at ? (
                                            <>
                                                <Link
                                                    href={admin.id === loggedAdmin ? '/dashboard/settings/profile' : `/dashboard/admins/${admin.id}/update`}
                                                    title={`To update ${admin.name}`}
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
                                                            After confirmation, admin user {admin.name} will no longer be able to access the system!
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
                                                                    name="csrfToken"
                                                                    value={csrfToken}
                                                                />
                                                                <input
                                                                    type="hidden"
                                                                    name="userId"
                                                                    value={admin.id}
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
                                            <Dialog key={admin.email}>
                                                <DialogTrigger asChild>
                                                    <button
                                                        type="button"
                                                        title={`Activate ${admin.name}`}
                                                        className="cursor-pointer"
                                                    >
                                                        <UserLock
                                                            aria-label={`Activate ${admin.name}`}
                                                            className="size-6 text-red-600 hover:text-green-500 duration-300"
                                                        />
                                                    </button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogTitle>
                                                        Are you sure?
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                        After confirmation, you will activate the admin user account {admin.name}!
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
                                                                name="csrfToken"
                                                                value={csrfToken}
                                                            />
                                                            <input
                                                                type="hidden"
                                                                name="userId"
                                                                value={admin.id}
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
            </div>
        </>
    );
}