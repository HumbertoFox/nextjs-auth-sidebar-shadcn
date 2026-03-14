import { RateLimitEntry } from '@/_types';


const ipStore = new Map<string, RateLimitEntry>();
const emailStore = new Map<string, RateLimitEntry>();

function prune(store: Map<string, RateLimitEntry>) {
    const now = Date.now();
    for (const [key, entry] of store) {
        if (entry.resetAt <= now) store.delete(key);
    }
}

function check(
    store: Map<string, RateLimitEntry>,
    key: string,
    maxRequests: number,
    windowMs: number
): { allowed: boolean; retryAfterSeconds: number } {
    prune(store);

    const now = Date.now();
    const entry = store.get(key);

    if (!entry || entry.resetAt <= now) {
        store.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, retryAfterSeconds: 0 };
    }

    if (entry.count >= maxRequests) {
        const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
        return { allowed: false, retryAfterSeconds };
    }

    entry.count += 1;
    return { allowed: true, retryAfterSeconds: 0 };
}

export function checkLoginRateLimit(
    ip: string,
    email: string
): { allowed: boolean; retryAfterSeconds: number; reason: 'ip' | 'email' | null } {
    const byIp = check(ipStore, ip, 5, 60_000);
    if (!byIp.allowed) {
        return { allowed: false, retryAfterSeconds: byIp.retryAfterSeconds, reason: 'ip' };
    }

    const byEmail = check(emailStore, email.toLowerCase(), 10, 15 * 60_000);
    if (!byEmail.allowed) {
        return { allowed: false, retryAfterSeconds: byEmail.retryAfterSeconds, reason: 'email' };
    }

    return { allowed: true, retryAfterSeconds: 0, reason: null };
}

export function resetLoginRateLimit(email: string) {
    emailStore.delete(email.toLowerCase());
}