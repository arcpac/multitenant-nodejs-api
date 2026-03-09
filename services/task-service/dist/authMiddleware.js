import jwt from "jsonwebtoken";
export function requireAuth(req, res, next) {
    const header = req.header("authorization") || "";
    const [type, token] = header.split(" ");
    if (type !== "Bearer" || !token) {
        return res.status(401).json({ code: "NO_TOKEN", error: "Missing Bearer token" });
    }
    try {
        const secret = process.env.ACCESS_TOKEN_SECRET;
        const payload = jwt.verify(token, secret);
        req.auth = payload;
        return next();
    }
    catch (err) {
        if (err?.name === "TokenExpiredError") {
            return res.status(401).json({ code: "TOKEN_EXPIRED", error: "Access token expired" });
        }
        return res.status(401).json({ code: "INVALID_TOKEN", error: "Invalid token" });
    }
}
