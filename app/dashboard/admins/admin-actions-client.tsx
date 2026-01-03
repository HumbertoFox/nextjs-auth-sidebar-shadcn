'use client';

import { Button } from '@/_components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/_components/ui/dialog';
import { AdminActionsProps } from '@/_types';
import { deleteUserById } from '@/app/api/actions/deleteadminuser';
import { reactivateAdminUserById } from '@/app/api/actions/reactivateadminuser';
import { UserLock, UserRoundPen, UserRoundX } from 'lucide-react';
import Link from 'next/link';

export default function AdminActionsClient({
    admin,
    loggedAdmin
}: AdminActionsProps) {
    if (!admin.deleted_at) {
        return (
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

                <Dialog>
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
        );
    }

    return (
        <Dialog>
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
    );
}