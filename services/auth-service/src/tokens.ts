import crypto from "crypto";
import jwt from "jsonwebtoken";

export type AccessPayload = {
    sub: string;   // userId
    orgId: string;
    role: string;
};

export function signAccessToken(payload: AccessPayload) {
    const { sub, orgId, role } = payload as AccessPayload

    const secret = process.env.ACCESS_TOKEN_SECRET!;
    const expiresIn = process.env.ACCESS_TOKEN_TTL ?? "15m";

    return jwt.sign(
        { sub: sub, orgId: orgId, role },
        secret,
        { expiresIn },
    );
}

// Refresh token is an opaque random string (NOT a JWT)
export function generateRefreshToken() {
    return crypto.randomBytes(48).toString("base64url");
}

// Store only a hash in DB so DB leaks don’t leak live refresh tokens
export function hashToken(token: string) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

export function refreshCookieOptions() {
    const days = Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 14);
    return {
        httpOnly: true,
        sameSite: "lax" as const,
        secure: false, // dev only (true in prod behind HTTPS)
        path: "/",
        maxAge: days * 24 * 60 * 60 * 1000,
    };
}
