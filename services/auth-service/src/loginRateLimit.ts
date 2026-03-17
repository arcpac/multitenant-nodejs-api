import { pool } from "./db.js";

type LimitRule = {
    windowSec: number;
    max: number;
};

export type RateLimitHit = {
    limited: boolean;
    retryAfterSec: number;
    remaining: number;
};

export type LoginLimitRules = {
    ip: LimitRule;
    ipEmail: LimitRule;
    email: LimitRule;
};

function parsePositiveInt(value: string | undefined, fallback: number): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
    return Math.floor(parsed);
}

export function getLoginLimitRules(): LoginLimitRules {
    return {
        ip: {
            windowSec: parsePositiveInt(process.env.LOGIN_LIMIT_IP_WINDOW_SEC, 15 * 60),
            max: parsePositiveInt(process.env.LOGIN_LIMIT_IP_MAX, 120),
        },
        ipEmail: {
            windowSec: parsePositiveInt(process.env.LOGIN_LIMIT_IP_EMAIL_WINDOW_SEC, 15 * 60),
            max: parsePositiveInt(process.env.LOGIN_LIMIT_IP_EMAIL_MAX, 10),
        },
        email: {
            windowSec: parsePositiveInt(process.env.LOGIN_LIMIT_EMAIL_WINDOW_SEC, 60 * 60),
            max: parsePositiveInt(process.env.LOGIN_LIMIT_EMAIL_MAX, 30),
        },
    };
}

export function buildIpKey(ip: string): string {
    return `ip:${ip}`;
}

export function buildIpEmailKey(ip: string, email: string): string {
    return `ip_email:${ip}:${email}`;
}

export function buildEmailKey(email: string): string {
    return `email:${email}`;
}

export async function hitLoginRateLimit(key: string, rule: LimitRule): Promise<RateLimitHit> {
    const result = await pool.query(
        `INSERT INTO login_rate_limits (key, count, window_end, updated_at)
         VALUES ($1, 1, now() + ($2::int * interval '1 second'), now())
         ON CONFLICT (key) DO UPDATE
         SET
           count = CASE
             WHEN login_rate_limits.window_end <= now() THEN 1
             ELSE login_rate_limits.count + 1
           END,
           window_end = CASE
             WHEN login_rate_limits.window_end <= now() THEN now() + ($2::int * interval '1 second')
             ELSE login_rate_limits.window_end
           END,
           updated_at = now()
         RETURNING count, window_end`,
        [key, rule.windowSec]
    );

    const row = result.rows[0] as { count: number; window_end: Date | string };
    const count = Number(row.count);
    const windowEnd = new Date(row.window_end);
    const limited = count > rule.max;
    const retryAfterSec = Math.max(1, Math.ceil((windowEnd.getTime() - Date.now()) / 1000));
    return {
        limited,
        retryAfterSec,
        remaining: Math.max(0, rule.max - count),
    };
}

export async function clearLoginRateLimitKey(key: string): Promise<void> {
    await pool.query(`DELETE FROM login_rate_limits WHERE key = $1`, [key]);
}
