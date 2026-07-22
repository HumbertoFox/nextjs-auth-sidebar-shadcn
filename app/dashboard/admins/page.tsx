import { DashboardSidebarHeader } from '@/_components/dashboard-sidebar-header';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/_components/ui/table';
import { getCsrfToken } from '@/_lib/csrf';
import { getUser } from '@/_lib/dal';
import { userRepository } from '@/_lib/userrepositorys';
import { UserDetailsProps } from '@/_types';
import { Metadata } from 'next';
import { AdminActionButtons } from '@/_components/admin-action-buttons';
import Image from 'next/image';
import { getInitials } from '@/_lib/get-initials';
import { ClockAlert, ClockCheck } from '@/_components/icons';

export const generateMetadata = async (): Promise<Metadata> => {
    return { title: 'Administrators' };
}

const breadcrumbItems = [
    { text: 'Dashboard', href: '/dashboard' },
    { text: 'Admins' }
];

export default async function AdminsPage() {
    const user = await getUser() as UserDetailsProps;
    const loggedAdmin = user.id;
    const [admins, csrfToken] = await Promise.all([
        userRepository.findAllAdmins(),
        getCsrfToken()
    ]);
    return (
        <>
            <DashboardSidebarHeader items={breadcrumbItems} />
            <div className="flex flex-1 flex-col gap-4 p-2">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-screen flex-1 overflow-hidden rounded-xl border md:min-h-min">
                    <Table className="w-full text-center text-xs">
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
                                    <TableCell className="max-lg:hidden">
                                        <div className="flex items-center justify-center gap-1">
                                            {admin.avatar ? (
                                                <Image
                                                    src={admin.avatar}
                                                    width={28}
                                                    height={28}
                                                    alt={`Avatar of ${admin.name}`}
                                                    className="rounded-full"
                                                />
                                            ) : (
                                                <span className="font-medium text-black dark:text-white">
                                                    {getInitials(admin.name)}
                                                </span>
                                            )}
                                            <span>-</span>
                                            {admin.name}
                                        </div>
                                    </TableCell>
                                    <TableCell title={admin.email_verified ? 'Email verified' : 'Email not verified'}>
                                        <div className='flex items-center justify-center gap-1'>
                                            {admin.email}
                                            {admin.email_verified ? <ClockCheck className="size-5 text-green-500" /> : <ClockAlert className=" size-5 text-orange-500" />}
                                        </div>
                                    </TableCell>
                                    <TableCell className="flex justify-evenly items-center my-1">
                                        <AdminActionButtons
                                            admin={admin}
                                            csrfToken={csrfToken}
                                            isLoggedAdmin={admin.id === loggedAdmin}
                                        />
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