import jwt from "jsonwebtoken";

export type AuthUser = {
    sub: string;
    orgId: string;
    role: string;
};

export function requireAuth(req: any, res: any, next: any) {
    const header = req.header("authorization") || "";
    const [type, token] = header.split(" ");
    if (type !== "Bearer" || !token) {
        return res.status(401).json({ code: "NO_TOKEN", error: "Missing Bearer token" });
    }

    try {
        const secret = process.env.ACCESS_TOKEN_SECRET!;
        const payload = jwt.verify(token, secret) as AuthUser;
        req.auth = payload;
        return next();
    } catch (err: any) {
        if (err?.name === "TokenExpiredError") {
            return res.status(401).json({ code: "TOKEN_EXPIRED", error: "Access token expired" });
        }
        return res.status(401).json({ code: "INVALID_TOKEN", error: "Invalid token" });
    }
}


// XBHwd_TKhrz7AjRNy7btvz1DJbeHOJum5FTYOYdPNzhvrVMuX-8Wwhvvm5FSijG-