import jwt from "jsonwebtoken";
export function getAuthFromAuthorizationHeader(header) {
    if (!header)
        throw new Error("Missing Authorization header");
    const [type, token] = header.split(" ");
    if (type !== "Bearer" || !token)
        throw new Error("Missing Bearer token");
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const payload = jwt.verify(token, secret);
    const orgId = payload.orgId;
    if (!payload.sub || !orgId || !payload.role)
        throw new Error("Invalid token payload");
    return { sub: payload.sub, orgId, role: payload.role };
}
