'use client';

import { Transition } from '@headlessui/react';
import { startTransition, useActionState, useEffect, useState } from 'react';
import DeleteUser from '@/_components/delete-user';
import { InputError } from '@/_components/input-error';
import { Button } from '@/_components/ui/button';
import { Input } from '@/_components/ui/input';
import { Label } from '@/_components/ui/label';
import { updateUser } from '@/app/api/actions/updateuser';
import { emailVerifiedChecked } from '@/app/api/actions/emailverified';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { handleImageChange } from '@/_lib/handleimagechange';

type ProfileForm = {
    name: string;
    email: string;
    avatar?: string | null;
};

type Props = ProfileForm & {
    mustVerifyEmail: boolean;
};

export default function ProfilePageClient({
    name,
    email,
    avatar,
    mustVerifyEmail,
}: Props) {
    const router = useRouter();
    const [state, action, pending] = useActionState(updateUser, undefined);
    const [imagePreview, setImagePreview] = useState<string | null | undefined>(avatar ?? null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [recentlySuccessful, setRecentlySuccessful] = useState<boolean>(false);
    const [data, setData] = useState<ProfileForm>({
        name: name,
        email: email,
        avatar: avatar
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setData({ ...data, [id]: value });
    };
    const onImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const { file, preview, error } = await handleImageChange(e);
        setImageFile(file);
        setImagePreview(preview ?? avatar);
        setImageError(error);
    };
    useEffect(() => {
        return () => {
            if (imagePreview && imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
        };
    }, [imagePreview]);
    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (imageError) return;
        const formData = new FormData(e.currentTarget);
        if (imageFile) formData.append('file', imageFile);
        startTransition(() => action(formData));
    };
    const handleVerifildEmail = async () => {
        const result = await emailVerifiedChecked();
        setStatus(result);
        if (result === 'verification-link-sent') {
            setTimeout(() => router.push('/logout'), 3000);
        }
    };
    useEffect(() => {
        if (state?.success) {
            setRecentlySuccessful(true);
            router.refresh();
            setTimeout(() => setRecentlySuccessful(false), 2000);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state]);
    return (
        <>
            <div className="space-y-6">
                <div className="mb-8 my-1 px-4 space-y-0.5">
                    <h2 className="text-xl font-semibold tracking-tight">Profile information</h2>
                    <p className="text-muted-foreground text-sm">Update your picture, name, and email address.</p>
                </div>
                <form onSubmit={submit} className="space-y-6">
                    <div className="flex flex-col-reverse justify-between lg:flex-row gap-6">
                        <div className="min-w-2/3 flex flex-col flex-1 gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    className="mt-1 block w-full"
                                    value={data.name}
                                    onChange={handleChange}
                                    required
                                    autoComplete="name"
                                    placeholder="Nome completo"
                                />
                                {state?.errors?.name?.[0] && <InputError message={state.errors.name[0]} />}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    value={data.email ?? ""}
                                    onChange={handleChange}
                                    required
                                    autoComplete="email"
                                    placeholder="email@exemple.com"
                                />
                                {state?.errors?.email?.[0] && <InputError message={state.errors.email[0]} />}
                            </div>

                            {mustVerifyEmail && (
                                <div>
                                    <p className="text-muted-foreground -mt-4 text-sm">
                                        Your email address has not been verified.&nbsp;&nbsp;
                                        <button
                                            type="button"
                                            onClick={handleVerifildEmail}
                                            className="text-foreground underline decoration-neutral-300 cursor-pointer underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                        >
                                            Click here to resend the verification email.
                                        </button>
                                    </p>

                                    {status === 'verification-link-sent' && (
                                        <div className="mt-2 text-sm font-medium text-green-600">
                                            Um novo link de verificação foi enviado para seu endereço de e-mail.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="grid gap-2 text-center">
                            <Label htmlFor="file">Foto de perfil</Label>
                            <div className="flex flex-col items-center gap-3">
                                <div className="relative size-40 rounded-full overflow-hidden border border-gray-300">
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
                    </div>

                    <div className="flex items-center gap-4">
                        <Button disabled={pending || Boolean(imageError)}>Save</Button>

                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <p className="text-sm text-neutral-600">Saved</p>
                        </Transition>
                    </div>
                </form>
            </div>

            <DeleteUser />
        </>
    );
}
