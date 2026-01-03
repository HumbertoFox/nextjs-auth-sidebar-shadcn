import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/_components/ui/table';
import { getUser } from '@/_lib/dal';
import { UserRepository } from '@/_lib/userrepository';
import { UserDetailsProps } from '@/_types';
import AdminActionsClient from './admin-actions-client';

export default async function AdminsTable() {
    const user = await getUser() as UserDetailsProps;
    const loggedAdmin = user.id;
    const admins = await UserRepository.findAllAdmins();
    return (
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
                                <AdminActionsClient
                                    admin={admin}
                                    loggedAdmin={loggedAdmin}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}