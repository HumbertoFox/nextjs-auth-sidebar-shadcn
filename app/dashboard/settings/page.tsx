import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';

const user = {
    name: "shadcn Ui",
    email: "shadcn.ui@example.com",
    avatar: null,
};

export default function SettingsPage() {
    const getInitials = useInitials();
    return (
        <div className="flex flex-1 gap-4 p-4">
            <div className="size-40 rounded-full overflow-hidden border border-gray-300">
                <Avatar className="size-full overflow-hidden rounded-full">
                    {user.avatar ? (
                        <AvatarImage
                            src={user.avatar}
                            alt={user.name}
                        />
                    ) : (
                        <AvatarFallback className="font-bold text-6xl bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white cursor-default">
                            {getInitials(user.name)}
                        </AvatarFallback>
                    )}
                </Avatar>
            </div>
            <div className=" flex flex-col justify-center gap-2 text-left leading-tight">
                <span className="truncate font-medium text-xl">{user.name}</span>
                <span className="text-muted-foreground truncate text-sm">{user.email}</span>
            </div>
        </div>
    );
}