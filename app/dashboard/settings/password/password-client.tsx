'use client';

import { InputError } from '@/_components/input-error';
import { useActionState, useEffect, useRef, useState } from 'react';
import { Button } from '@/_components/ui/button';
import { Input } from '@/_components/ui/input';
import { Label } from '@/_components/ui/label';
import { Eye, EyeClosed, LoaderCircle } from 'lucide-react';
import { updatePassword } from '@/_actions/updatepassword';
import { csrfTokenProps } from '@/_types';
import { PasswordChecklist } from '@/_components/password-checklist';

export default function PasswordPageClient({ csrfToken }: csrfTokenProps) {
    const formRef = useRef<HTMLFormElement>(null);
    const currentPasswordInputRef = useRef<HTMLInputElement>(null);

    const [state, action, pending] = useActionState(updatePassword, undefined);
    const [lastTs, setLastTs] = useState(state?.ts);

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const [recentlySuccessful, setRecentlySuccessful] = useState<boolean>(false);

    // Estado mínimo e isolado apenas para a checklist em tempo real
    const [passwordVal, setPasswordVal] = useState('');

    const toggleShowOldPassword = () => setShowOldPassword(!showOldPassword);
    const toggleShowPassword = () => setShowPassword(!showPassword);
    const toggleShowPasswordConfirm = () => setShowPasswordConfirm(!showPasswordConfirm);

    if (state?.ts && state.ts !== lastTs) {
        setLastTs(state.ts);
        setRecentlySuccessful(true);
        setPasswordVal('');
    }
    
    useEffect(() => {
        if (!state?.ts) return;
        formRef.current?.reset();
        currentPasswordInputRef.current?.focus();
    }, [state?.ts]);
    useEffect(() => {
        if (!recentlySuccessful) return;
        const timeout = setTimeout(() => setRecentlySuccessful(false), 2000);
        return () => clearTimeout(timeout);
    }, [recentlySuccessful]);
    return (
        <>
            <div className="space-y-6">
                <div className="mb-8 my-1 space-y-0.5">
                    <h2 className="text-xl font-semibold tracking-tight">Update password</h2>
                    <p className="text-muted-foreground text-sm">Make sure your account uses a long, random password to stay secure.</p>
                </div>

                <form
                    ref={formRef}
                    action={action}
                    className="space-y-6"
                >
                    {/* CSRF Token nativo e invisível no formulário */}
                    <input
                        type="hidden"
                        name="csrfToken"
                        value={csrfToken ?? ''}
                    />

                    <div className="grid gap-2">
                        <Label htmlFor="current_password">Current password</Label>
                        <div className="relative">
                            <Input
                                id="current_password"
                                name="current_password"
                                autoComplete="off"
                                tabIndex={1}
                                ref={currentPasswordInputRef}
                                type={showOldPassword ? "text" : "password"}
                                placeholder="Current password"
                                required
                                className="block w-full"
                            />
                            <button
                                type="button"
                                title={showOldPassword ? "Hide password" : "Show password"}
                                onClick={toggleShowOldPassword}
                                className="btn-icon-toggle"
                            >
                                {showOldPassword ? <Eye /> : <EyeClosed />}
                            </button>
                        </div>
                        {state?.errors?.current_password?.[0] && <InputError message={state.errors.current_password[0]} />}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">New Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                name="password"
                                autoComplete="off"
                                tabIndex={2}
                                onChange={(e) => setPasswordVal(e.target.value)}
                                type={showPassword ? "text" : "password"}
                                placeholder="New Password"
                                required
                                className="block w-full"
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
                        <PasswordChecklist password={passwordVal} />
                        {state?.errors?.password?.[0] && <InputError message={state.errors.password[0]} />}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirm your new password.</Label>
                        <div className="relative">
                            <Input
                                id="password_confirmation"
                                name="password_confirmation"
                                autoComplete="off"
                                tabIndex={3}
                                type={showPasswordConfirm ? "text" : "password"}
                                placeholder="Confirm your new password."
                                required
                                className="block w-full"
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

                    <div className="flex items-center gap-4">
                        <Button
                            type="submit"
                            tabIndex={4}
                            disabled={pending}
                            className="flex items-center gap-2"
                        >
                            {pending && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Save password
                        </Button>

                        <p className={`text-sm text-green-600 font-medium transition-opacity duration-300 ${recentlySuccessful ? 'opacity-100' : 'opacity-0'}`}>
                            Saved successfully!
                        </p>
                    </div>
                </form>
            </div>
        </>
    );
}