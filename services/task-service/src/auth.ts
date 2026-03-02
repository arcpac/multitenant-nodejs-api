import jwt from "jsonwebtoken";

export type AuthUser = {
    sub: string;   // userId
    orgId: string; // active org
    role: string;
};

export function getAuthFromAuthorizationHeader(header: string | null): AuthUser {
    if (!header) throw new Error("Missing Authorization header");
    console.log('getAuthFromAuthorizationHeader')
    const [type, token] = header.split(" ");
    console.log('type: ', type)
    console.log('token: ', token)
    if (type !== "Bearer" || !token) throw new Error("Missing Bearer token");

    const secret = process.env.ACCESS_TOKEN_SECRET!;
    const payload = jwt.verify(token, secret) as any;

    const orgId = payload.orgId
    if (!payload.sub || !orgId || !payload.role) throw new Error("Invalid token payload");

    return { sub: payload.sub, orgId, role: payload.role };
}