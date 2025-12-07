import { LucideIcon } from 'lucide-react';

export type UserDetailsProps = {
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly avatar?: string | null;
    readonly role: string;
    readonly email_verified?: string | null;
    readonly created_at: string;
    readonly updated_at: string;
}

export type UserProfilePageProps = {
    readonly name: string;
    readonly email: string;
    readonly avatar?: string | null;
    readonly email_verified?: string | null;
}

export type UserSettingsClientProps = {
    readonly user: UserDetailsProps;
}

export type ProfileForm = {
    readonly name: string;
    readonly email: string;
    readonly avatar?: string | null;
}

export type ProfileFormClientProps = ProfileForm & {
    readonly mustVerifyEmail: boolean;
}

export type UserInfoProps = {
    readonly user: ProfileForm;
    readonly showEmail?: boolean;
}

export type UserComponentProps = {
    readonly user: ProfileForm;
}

export type BreadcrumbItemProps = {
    text: string;
    href?: string;
}

export type SidebarNavItemProps = {
    text: string;
    href: string;
}

export type NavMainItemProps = {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export type DashboardSidebarHeaderProps = {
    items: BreadcrumbItemProps[];
}

export type HeadingProps = {
    title: string;
    description?: string;
}

export type RegisterFormProps = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    avatar?: File;
}

export type LoginFormProps = {
    email: string;
    password: string;
}