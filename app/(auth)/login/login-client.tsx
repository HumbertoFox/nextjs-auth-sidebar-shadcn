'use client';

import { Eye, EyeClosed, LoaderCircle } from 'lucide-react';
import { startTransition, useActionState, useEffect, useRef, useState } from 'react';
import { InputError } from '@/_components/input-error';
import { TextLink } from '@/_components/text-link';
import { Button } from '@/_components/ui/button';
import { Input } from '@/_components/ui/input';
import { Label } from '@/_components/ui/label';
import { loginUser } from '@/app/api/actions/loginuser';
import { useRouter, useSearchParams } from 'next/navigation';

type LoginForm = {
    email: string;
    password: string;
};

export function LoginClient() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<string | boolean>(false);
    const canResetPassword = !status;
    const router = useRouter();
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const [state, action, pending] = useActionState(loginUser, undefined);
    const [isVisibledPassword, setIsVisibledPassword] = useState<boolean>(false);
    const [data, setData] = useState<LoginForm>({
        email: '',
        password: '',
    });

    const togglePasswordVisibility = () => setIsVisibledPassword(!isVisibledPassword);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setData({ ...data, [id]: value });
    };
    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(() => action(formData));
    };

    useEffect(() => {
        const statusFromParams = searchParams.get('status');
        const emailFromParams = searchParams.get('email');

        if (emailFromParams) {
            setData((prevData) => ({ ...prevData, email: emailFromParams }));
            passwordRef?.current?.focus();
        };

        if (statusFromParams) {
            setStatus(statusFromParams);
            const timer = setTimeout(() => setStatus(true), 5000);
            return () => clearTimeout(timer);
        };
    }, [searchParams]);
    useEffect(() => {
        if (state?.message) {
            setData({
                email: '',
                password: ''
            });
            router.push('/dashboard');
        };
        if (state?.warning && emailRef.current) {
            emailRef.current.focus();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state]);
    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-xl font-medium">Log in to your account</h1>
                <p className="text-muted-foreground text-sm text-balance">
                    Enter your email and password below to log in.
                </p>
            </div>
            <form
                onSubmit={submit}
                className="w-full max-w-xs flex flex-col gap-6"
            >
                <div className=" grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            ref={emailRef}
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={handleChange}
                            placeholder="email@exemple.com"
                        />
                        {state?.errors?.email?.[0] && <InputError message={state.errors.email[0]} />}
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            {canResetPassword && (
                                <TextLink
                                    href="/forgot-password"
                                    className="ml-auto text-sm"
                                    tabIndex={5}
                                >
                                    Forgot your password?
                                </TextLink>
                            )}
                        </div>

                        <div className="relative">
                            <Input
                                id="password"
                                name="password"
                                type={isVisibledPassword ? "text" : "password"}
                                ref={passwordRef}
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                value={data.password}
                                onChange={handleChange}
                                placeholder="Password"
                            />
                            <button
                                type="button"
                                title={isVisibledPassword ? "Ocultar senha" : "Mostrar senha"}
                                onClick={togglePasswordVisibility}
                                className="btn-icon-toggle"
                            >
                                {isVisibledPassword ? <Eye /> : <EyeClosed />}
                            </button>
                        </div>
                        {state?.errors?.password?.[0] && <InputError message={state.errors.password[0]} />}
                    </div>

                    <Button
                        type="submit"
                        className="mt-4 w-full"
                        tabIndex={3}
                        disabled={pending}
                    >
                        {pending && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Log in
                    </Button>

                    <div className="text-muted-foreground text-center text-sm">
                        There is no account!&nbsp;&nbsp;
                        <TextLink
                            href="/register"
                            tabIndex={4}
                        >
                            Sign up
                        </TextLink>
                    </div>
                </div>
            </form>

            {status && <div className="mb-4 text-center text-sm font-medium text-blue-600">{status}</div>}
            {state?.message && <div className="mb-4 text-center text-sm font-medium text-blue-600">{state.message}</div>}
            {state?.warning && <div className="mb-4 text-center text-sm font-medium text-red-400">{state.warning}</div>}
        </div>
    );
}
