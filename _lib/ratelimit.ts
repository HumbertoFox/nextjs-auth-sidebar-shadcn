import { rateLimitRepository } from '@/_lib/ratelimitrepositorys';


const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 10 * 60_000; // 10 minutos

async function check(
    key: string,
    maxRequests: number,
    windowMs: number
): Promise<{ allowed: boolean; retryAfterSeconds: number; count: number }> {
    const now = new Date();
    const resetAt = new Date(Date.now() + windowMs);

    const entry = await rateLimitRepository.incrementAndCheck(key, resetAt);

    if (entry.count > maxRequests) {
        const retryAfterSeconds = Math.ceil((entry.reset_at.getTime() - now.getTime()) / 1000);
        return { allowed: false, retryAfterSeconds, count: entry.count };
    }

    return { allowed: true, retryAfterSeconds: 0, count: entry.count };
}

export async function checkLoginRateLimit(
    ip: string,
    email: string
): Promise<{
    allowed: boolean;
    retryAfterSeconds: number;
    reason: 'ip' | 'email' | null;
    warning?: 'will-be-blocked';
}> {
    const byIp = await check(`login:ip:${ip}`, LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS);
    if (!byIp.allowed) {
        return { allowed: false, retryAfterSeconds: byIp.retryAfterSeconds, reason: 'ip' };
    }

    const byEmail = await check(`login:email:${email.toLowerCase()}`, LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS);
    if (!byEmail.allowed) {
        return { allowed: false, retryAfterSeconds: byEmail.retryAfterSeconds, reason: 'email' };
    }

    // Na quarta tentativa exibe aviso (uma antes do bloqueio)
    const isLastWarning = byEmail.count === LOGIN_MAX_ATTEMPTS - 1;

    return {
        allowed: true,
        retryAfterSeconds: 0,
        reason: null,
        ...(isLastWarning && { warning: 'will-be-blocked' }),
    };
}

export async function resetLoginRateLimit(email: string): Promise<void> {
    await rateLimitRepository.deleteByKey(`login:email:${email.toLowerCase()}`);
}

export async function checkForgotPasswordRateLimit(
    email: string
): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
    return check(`forgot:email:${email.toLowerCase()}`, 3, 15 * 60_000);
}