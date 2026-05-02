'use client';

import { PasswordChecklistProps } from '@/_types';

export function PasswordChecklist({ password }: PasswordChecklistProps) {
    const checks = [
        {
            label: 'At least 8 characters',
            valid: password.length >= 8
        },
        {
            label: 'One uppercase letter',
            valid: /[A-Z]/.test(password)
        },
        {
            label: 'One lowercase letter',
            valid: /[a-z]/.test(password)
        },
        {
            label: 'One number',
            valid: /[0-9]/.test(password)
        },
        {
            label: 'One special character (e.g. !@#$%&)',
            valid: /[^A-Za-z0-9]/.test(password)
        },
    ];

    if (!password) return null;

    const allValid = checks.every(({ valid }) => valid);

    if (allValid) {
        return (
            <p className="flex items-center gap-2 text-xs text-green-600 mt-1">
                <span className="text-base leading-none">✓</span>
                Strong password!
            </p>
        );
    }

    return (
        <ul className="mt-1 space-y-1">
            {checks.map(({ label, valid }) => (
                <li
                    key={label}
                    className={`flex items-center gap-2 text-xs ${valid ? 'text-green-600' : 'text-red-500'}`}
                >
                    <span className="text-base leading-none">{valid ? '✓' : '✗'}</span>
                    {label}
                </li>
            ))}
        </ul>
    );
}