'use client';

import { ChangeEvent, startTransition, useActionState, useEffect, useState } from 'react';
import DeleteUser from '@/_components/delete-user';
import { InputError } from '@/_components/input-error';
import { Button } from '@/_components/ui/button';
import { Input } from '@/_components/ui/input';
import { Label } from '@/_components/ui/label';
import { updateUser } from '@/_actions/updateuser';
import { emailVerifiedChecked } from '@/_actions/emailverified';
import Image from 'next/image';
import { handleImageChange } from '@/_lib/handleimagechange';
import { ProfileForm, ProfileFormClientProps } from '@/_types';

const providers: Record<string, { name: string; url: string }> = {
    'gmail.com': { name: 'Gmail', url: 'https://mail.google.com' },
    'outlook.com': { name: 'Outlook', url: 'https://mail.live.com' },
    'hotmail.com': { name: 'Hotmail', url: 'https://mail.live.com' },
    'live.com': { name: 'Outlook', url: 'https://mail.live.com' },
};

export default function ProfilePageClient({ name, email, avatar, mustVerifyEmail, csrfToken }: ProfileFormClientProps) {
    const domain = email?.split('@')[1];
    const [state, action, pending] = useActionState(updateUser, undefined);
    const [imagePreview, setImagePreview] = useState<string | null | undefined>(avatar);
    const [imageError, setImageError] = useState<string | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [recentlySuccessful, setRecentlySuccessful] = useState<boolean>(false);
    const provider = domain ? providers[domain] : null;
    const [data, setData] = useState<ProfileForm>({
        name: name,
        email: email,
        avatar: avatar
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };
    const onImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const { preview, error } = await handleImageChange(e);
        setImagePreview(preview ?? avatar);
        setImageError(error);
    };
    useEffect(() => {
        return () => {
            if (imagePreview && imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
        };
    }, [imagePreview]);
    const handleVerifildEmail = async () => {
        const result = await emailVerifiedChecked();
        setStatus(result);
    };
    useEffect(() => {
        if (!state?.ts) return;

        startTransition(() => setRecentlySuccessful(true));

        const timeout = setTimeout(() => setRecentlySuccessful(false), 2000);

        return () => clearTimeout(timeout);
    }, [state?.ts]);
    return (
        <>
            <div className="space-y-6">
                <div className="mb-8 my-1 space-y-0.5">
                    <h2 className="text-xl font-semibold tracking-tight">Profile information</h2>
                    <p className="text-muted-foreground text-sm">Update your picture, name, and email address.</p>
                </div>
                <form
                    action={action}
                    className="space-y-6"
                >
                    {/* CSRF Token nativo e invisível no formulário */}
                    <input
                        type="hidden"
                        name="csrfToken"
                        value={csrfToken ?? ''}
                    />

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
                                            A new verification link has been sent to your email address.
                                        </div>
                                    )}
                                </div>
                            )}
                            {provider && (
                                <div className="flex">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        asChild
                                    >
                                        <a
                                            href={provider.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Open {provider.name}
                                        </a>
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label
                                htmlFor="file"
                                className="mx-auto"
                            >
                                Profile picture &#40;optional&#41;
                            </Label>
                            <div className="flex flex-col items-center gap-3">
                                <div className="relative size-40 rounded-full overflow-hidden border border-gray-300">
                                    {imagePreview ? (
                                        <Image
                                            src={imagePreview}
                                            alt="Preview avatar"
                                            width={512}
                                            height={512}
                                            onError={() => setImagePreview(null)}
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
                                    className="cursor-pointer px-3 py-1 text-sm border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
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
                        <Button
                            type='submit'
                            disabled={pending || Boolean(imageError)}
                        >
                            Save
                        </Button>

                        <p className={`text-sm text-neutral-600 transition ease-in-out ${recentlySuccessful ? 'opacity-100' : 'opacity-0'}`}>Saved</p>
                    </div>
                </form>
            </div>

            <DeleteUser csrfToken={csrfToken} />
        </>
    );
}