"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAccessToken = signAccessToken;
exports.generateRefreshToken = generateRefreshToken;
exports.hashToken = hashToken;
exports.refreshCookieOptions = refreshCookieOptions;
var crypto_1 = require("crypto");
var jsonwebtoken_1 = require("jsonwebtoken");
function signAccessToken(payload) {
    var _a;
    var _b = payload, sub = _b.sub, orgId = _b.orgId, role = _b.role;
    var secret = process.env.ACCESS_TOKEN_SECRET;
    var expiresIn = (_a = process.env.ACCESS_TOKEN_TTL) !== null && _a !== void 0 ? _a : "15m";
    return jsonwebtoken_1.default.sign({ sub: sub, orgId: orgId, role: role }, secret, { expiresIn: expiresIn });
}
// Refresh token is an opaque random string (NOT a JWT)
function generateRefreshToken() {
    return crypto_1.default.randomBytes(48).toString("base64url");
}
// Store only a hash in DB so DB leaks don’t leak live refresh tokens
function hashToken(token) {
    return crypto_1.default.createHash("sha256").update(token).digest("hex");
}
function refreshCookieOptions() {
    var _a;
    console.log('refreshCookieOptions() called');
    var days = Number((_a = process.env.REFRESH_TOKEN_TTL_DAYS) !== null && _a !== void 0 ? _a : 14);
    return {
        httpOnly: true,
        sameSite: "lax",
        secure: false, // dev only (true in prod behind HTTPS)
        path: "/",
        maxAge: days * 24 * 60 * 60 * 1000,
    };
}
