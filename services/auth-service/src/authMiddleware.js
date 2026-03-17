"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
var jsonwebtoken_1 = require("jsonwebtoken");
function requireAuth(req, res, next) {
    var header = req.header("authorization") || "";
    var _a = header.split(" "), type = _a[0], token = _a[1];
    if (type !== "Bearer" || !token) {
        return res.status(401).json({ code: "NO_TOKEN", error: "Missing Bearer token" });
    }
    try {
        var secret = process.env.ACCESS_TOKEN_SECRET;
        var payload = jsonwebtoken_1.default.verify(token, secret);
        req.auth = payload;
        return next();
    }
    catch (err) {
        if ((err === null || err === void 0 ? void 0 : err.name) === "TokenExpiredError") {
            return res.status(401).json({ code: "TOKEN_EXPIRED", error: "Access token expired" });
        }
        return res.status(401).json({ code: "INVALID_TOKEN", error: "Invalid token" });
    }
}
// XBHwd_TKhrz7AjRNy7btvz1DJbeHOJum5FTYOYdPNzhvrVMuX-8Wwhvvm5FSijG-
