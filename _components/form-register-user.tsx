'use client';

import { Eye, EyeClosed, LoaderCircle } from 'lucide-react';
import { startTransition, useActionState, useEffect, useRef, useState } from 'react';
import { InputError } from '@/_components/input-error';
import { Button } from '@/_components/ui/button';
import { Input } from '@/_components/ui/input';
import { Label } from '@/_components/ui/label';
import { handleImageChange } from '@/_lib/handleimagechange';
import Image from 'next/image';
import { createUpdateAdminUser } from '@/app/api/actions/createupdateadminuser';
import { RegisterFormUserProps, UserFormProps } from '@/_types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useRouter } from 'next/navigation';

export default function RegisterUpdateUserForm({
    user,
    isEdit,
    titleForm,
    valueButton,
}: RegisterFormUserProps) {
    const router = useRouter();
    const emailRef = useRef<HTMLInputElement>(null);
    const [state, action, pending] = useActionState(createUpdateAdminUser, undefined);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState<boolean>(false);
    const [data, setData] = useState<UserFormProps>({
        id: user?.id ?? '',
        name: user?.name ?? '',
        email: user?.email ?? '',
        role: user?.role ?? 'USER',
        password: '',
        password_confirmation: '',
        avatar: user?.avatar ?? undefined,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setData({ ...data, [id]: value });
    };
    const onImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const { file, preview, error } = await handleImageChange(e);
        setImageFile(file);
        setImagePreview(preview);
        setImageError(error);
    };
    const toggleShowPassword = () => setShowPassword(prev => !prev);
    const toggleShowPasswordConfirm = () => setShowPasswordConfirm(prev => !prev);
    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (imageError) return;
        const formData = new FormData(e.currentTarget);
        if (imageFile) formData.append('file', imageFile);
        startTransition(() => action(formData));
    };
    useEffect(() => {
        if (state?.message) {
            const { role } = data;

            if (!isEdit) {
                startTransition(() => {
                    setData({
                        id: '',
                        name: '',
                        email: '',
                        password: '',
                        role: 'USER',
                        password_confirmation: '',
                        avatar: undefined,
                    });
                });
            }

            if (role === 'USER') {
                router.push('/dashboard/admins/users');
            } else {
                router.push('/dashboard/admins');
            }
        };
    }, [state?.message, router, data, isEdit]);
    return (
        <div className="max-w-96 space-y-6 p-4 mx-auto md:mx-0">
            <div className="flex flex-col items-center gap-2 text-center mx-auto">
                <h1 className="text-xl font-medium">{titleForm}</h1>
                <p className="text-muted-foreground text-sm text-balance">
                    {`Enter ${isEdit ? 'user' : 'your'} details below to ${isEdit ? 'update' : 'create your'} account.`}
                </p>
            </div>
            <form
                onSubmit={submit}
                className="w-full flex flex-col gap-6"
            >
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label
                            htmlFor="file"
                            className="mx-auto"
                        >
                            Profile picture
                        </Label>
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative w-24 h-24 rounded-full overflow-hidden border border-gray-300">
                                {imagePreview ? (
                                    <Image
                                        src={imagePreview}
                                        alt="Preview"
                                        width={512}
                                        height={512}
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-sm text-gray-400 bg-gray-50">
                                        No image
                                    </div>
                                )}
                            </div>

                            <Label
                                htmlFor="file"
                                title={imageError ? "Click on Select image and then Cancel." : "Select profile picture"}
                                className="cursor-pointer px-3 py-1 text-sm border rounded-md hover:bg-gray-50"
                            >
                                Select image
                            </Label>
                            <Input
                                id="file"
                                name="file"
                                type="file"
                                tabIndex={1}
                                accept="image/jpeg, image/png, image/webp"
                                onChange={onImageChange}
                                disabled={pending}
                                className="hidden"
                            />
                            {imageError && <InputError message={imageError} />}
                            {state?.errors?.avatar?.[0] && <InputError message={state.errors.avatar[0]} />}
                        </div>
                    </div>

                    {isEdit && (
                        <div className="grid gap-2">
                            <Label htmlFor="id">ID.</Label>
                            <Input
                                id="id"
                                name="id"
                                type="text"
                                required={isEdit}
                                autoComplete="id"
                                value={data.id}
                                onChange={handleChange}
                                disabled={pending}
                                readOnly
                                className="cursor-default"
                            />
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={2}
                            autoComplete="name"
                            value={data.name}
                            onChange={handleChange}
                            disabled={pending}
                            placeholder="Full name"
                        />
                        {state?.errors?.name?.[0] && <InputError message={state.errors.name[0]} />}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            ref={emailRef}
                            required
                            tabIndex={3}
                            autoComplete="email"
                            value={data.email}
                            onChange={handleChange}
                            disabled={pending}
                            placeholder="email@exemple.com"
                        />
                        {state?.errors?.email?.[0] && <InputError message={state.errors.email[0]} />}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required={!isEdit}
                                tabIndex={4}
                                value={data.password}
                                onChange={handleChange}
                                disabled={pending}
                                placeholder="Password"
                            />
                            <button
                                type="button"
                                title={showPassword ? "Hide password" : "Show password"}
                                onClick={toggleShowPassword}
                                className="btn-icon-toggle"
                            >
                                {showPassword ? <Eye /> : <EyeClosed />}
                            </button>
                        </div>
                        {state?.errors?.password?.[0] && <InputError message={state.errors.password[0]} />}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirm your password.</Label>
                        <div className="relative">
                            <Input
                                id="password_confirmation"
                                name="password_confirmation"
                                type={showPasswordConfirm ? "text" : "password"}
                                required={!isEdit}
                                tabIndex={5}
                                value={data.password_confirmation}
                                onChange={handleChange}
                                disabled={pending}
                                placeholder="Confirm your password."
                            />
                            <button
                                type="button"
                                title={showPasswordConfirm ? "Hide password" : "Show password"}
                                onClick={toggleShowPasswordConfirm}
                                className="btn-icon-toggle"
                            >
                                {showPasswordConfirm ? <Eye /> : <EyeClosed />}
                            </button>
                        </div>
                        {state?.errors?.password_confirmation?.[0] && <InputError message={state.errors.password_confirmation[0]} />}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="role">Account type</Label>
                        <Select
                            required
                            value={data.role}
                            onValueChange={(value) => setData((prev) => ({ ...prev, role: value }))}
                            disabled={pending}
                        >
                            <SelectTrigger
                                id="role"
                                name="role"
                                title="Select the account type."
                                tabIndex={6}
                            >
                                <SelectValue placeholder="Account type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="USER">
                                    User
                                </SelectItem>
                                <SelectItem value="ADMIN">
                                    Admin
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        {state?.errors?.role?.[0] && <InputError message={state.errors.role[0]} />}
                    </div>
                    <input
                        type="hidden"
                        name="role"
                        value={data.role}
                    />

                    <Button
                        type="submit"
                        tabIndex={6}
                        disabled={pending || Boolean(imageError)}
                        aria-busy={pending || Boolean(imageError)}
                        className="mt-2 w-full"
                    >
                        {pending && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {valueButton}
                    </Button>
                </div>
            </form>
        </div>
    );
}
