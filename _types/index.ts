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
    readonly text: string;
    readonly href?: string;
}

export type SidebarNavItemProps = {
    readonly text: string;
    readonly href: string;
}

export type NavMainItemProps = {
    readonly title: string;
    readonly href: string;
    readonly icon?: LucideIcon | null;
    readonly isActive?: boolean;
}

export type DashboardSidebarHeaderProps = {
    readonly items: BreadcrumbItemProps[];
}

export type HeadingProps = {
    readonly title: string;
    readonly description?: string;
}

export type RegisterFormProps = {
    readonly name: string;
    readonly email: string;
    readonly password: string;
    readonly password_confirmation: string;
    readonly avatar?: File;
}

export type LoginFormProps = {
    readonly email: string;
    readonly password: string;
}

export type UserFormProps = ProfileForm & {
    readonly id: string;
    readonly role: string;
    readonly password: string;
    readonly password_confirmation?: string;
}

export type RegisterFormUserProps = {
    readonly user?: UserFormProps;
    readonly isEdit?: boolean;
    readonly titleForm: string;
    readonly valueButton?: string;
}