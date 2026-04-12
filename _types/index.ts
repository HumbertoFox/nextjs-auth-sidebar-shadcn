import { LucideIcon } from 'lucide-react';

export type UserRole = 'USER' | 'ADMIN';

export const UserRolesZod: UserRole[] = [
    'USER',
    'ADMIN'
];

export const roleLabels: Record<UserRole, string> = {
    ADMIN: 'Admin',
    USER: 'User',
}

export const CSRF_COOKIE_NAME = 'csrfToken';

export type UserDetailsProps = {
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly avatar?: string | null;
    readonly role: UserRole;
    readonly email_verified?: string | null;
    readonly deleted_at?: string | null;
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
    user: UserDetailsProps;
}

export type ProfileForm = {
    readonly name: string;
    readonly email: string;
    readonly avatar?: string | null;
}

export type csrfTokenProps = {
    readonly csrfToken?: string;
}

export type ProfileFormClientProps = ProfileForm & csrfTokenProps & {
    readonly mustVerifyEmail: boolean;
}

export type UserComponentProps = {
    user: ProfileForm;
}

export type UserInfoProps = UserComponentProps & {
    readonly showEmail?: boolean;
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

export type LoginFormProps = {
    readonly email: string;
    readonly password: string;
}

export type RegisterFormProps = LoginFormProps & {
    readonly name: string;
    readonly password_confirmation: string;
    readonly avatar?: File;
}

export type UserFormProps = ProfileForm & {
    readonly id: string;
    readonly role: UserRole;
    readonly password: string;
    readonly password_confirmation?: string;
}

export type RegisterFormUserProps = csrfTokenProps & {
    user?: UserFormProps;
    readonly isEdit?: boolean;
    readonly titleForm: string;
    readonly valueButton?: string;
}

export type ResetPasswordForm = {
    readonly token: string;
    readonly password: string;
    readonly password_confirmation: string;
}

export type UsersActionsProps = {
    readonly id: string;
    readonly name: string;
    readonly deleted_at?: string | null;
}

export type UserActionsProps = {
    user: UsersActionsProps;
}

export type UserActionButtonsProps = {
    user: {
        id: string;
        name: string;
        email: string;
        deleted_at?: string | null;
    };
    csrfToken?: string;
}

export type AdminActionsProps = {
    admin: UsersActionsProps;
    readonly loggedAdmin: string;
}

export type AdminActionButtonsProps = {
    admin: {
        id: string;
        name: string;
        email: string;
        deleted_at?: string | null;
    };
    csrfToken?: string;
    isLoggedAdmin: boolean;
}

export type User = {
    id: string;
    name: string;
    role: UserRole;
    avatar?: string | null;
    email_verified?: string | null;
    deleted_at?: string | null;
    created_at: string;
    updated_at: string;
} & LoginFormProps;

export type VerificationToken = {
    identifier: string;
    token: string;
    expires_at: string;
}

export type RateLimitEntry = {
    count: number;
    reset_at: string;
}

export type PasswordChecklistProps = {
    password: string;
}