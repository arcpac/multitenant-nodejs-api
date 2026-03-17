"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var express_1 = require("express");
var cors_1 = require("cors");
var cookie_parser_1 = require("cookie-parser");
var bcryptjs_1 = require("bcryptjs");
var db_js_1 = require("./db.js");
var tokens_js_1 = require("./tokens.js");
var registerSchema_js_1 = require("./models/registerSchema.js");
var authMiddleware_js_1 = require("./authMiddleware.js");
var loginRateLimit_js_1 = require("./loginRateLimit.js");
var app = (0, express_1.default)();
var loginLimitRules = (0, loginRateLimit_js_1.getLoginLimitRules)();
app.use((0, cors_1.default)({ origin: true, credentials: true }));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
function sendLoginRateLimited(res, retryAfterSec) {
    res.setHeader("Retry-After", String(retryAfterSec));
    return res.status(429).json({
        code: "LOGIN_RATE_LIMITED",
        error: "Too many login attempts. Please try again later.",
    });
}
app.get("/health", function (_req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var r;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_js_1.pool.query("select 1 as ok")];
            case 1:
                r = _a.sent();
                res.json({ ok: true, service: "auth-service", db: r.rows[0].ok === 1 });
                return [2 /*return*/];
        }
    });
}); });
/**
 * POST /auth/register
 * Creates:
 * - users row
 * - org row (reuses existing org if name already exists)
 * - memberships row (OWNER)
 * - refresh_sessions row (stores refresh token hash)
 * Returns:
 * - accessToken (JWT)
 * - refresh_token cookie (httpOnly)
 */
app.post("/auth/register", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var parsed, _a, email, password, orgName, firstName, lastName, normalizedOrgName, client, passwordHash, userResult, orgResult, user, org, membershipResult, role, accessToken, refreshToken, refreshHash, days, expiresAt, e_1;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                parsed = registerSchema_js_1.registerSchema.safeParse(req.body);
                if (!parsed.success)
                    return [2 /*return*/, res.status(400).json({ error: parsed.error.flatten() })];
                _a = parsed.data, email = _a.email, password = _a.password, orgName = _a.orgName, firstName = _a.firstName, lastName = _a.lastName;
                normalizedOrgName = orgName.trim();
                return [4 /*yield*/, db_js_1.pool.connect()];
            case 1:
                client = _d.sent();
                _d.label = 2;
            case 2:
                _d.trys.push([2, 12, 14, 15]);
                return [4 /*yield*/, client.query("BEGIN")];
            case 3:
                _d.sent();
                return [4 /*yield*/, bcryptjs_1.default.hash(password, 12)];
            case 4:
                passwordHash = _d.sent();
                return [4 /*yield*/, client.query("INSERT INTO users (email, password_hash, first_name, last_name)\n       VALUES ($1, $2, $3, $4)\n       RETURNING id, email, first_name, last_name", [email.toLowerCase(), passwordHash, firstName !== null && firstName !== void 0 ? firstName : null, lastName !== null && lastName !== void 0 ? lastName : null])];
            case 5:
                userResult = _d.sent();
                return [4 /*yield*/, client.query("SELECT id, name\n             FROM orgs\n             WHERE name = $1\n             ORDER BY created_at ASC\n             LIMIT 1", [normalizedOrgName])];
            case 6:
                orgResult = _d.sent();
                if (!(orgResult.rowCount === 0)) return [3 /*break*/, 8];
                return [4 /*yield*/, client.query("INSERT INTO orgs (name)\n                 VALUES ($1)\n                 RETURNING id, name", [normalizedOrgName])];
            case 7:
                orgResult = _d.sent();
                _d.label = 8;
            case 8:
                user = userResult.rows[0];
                org = orgResult.rows[0];
                return [4 /*yield*/, client.query("INSERT INTO memberships (user_id, org_id, role)\n       VALUES ($1, $2, 'OWNER')\n       RETURNING role", [user.id, org.id])];
            case 9:
                membershipResult = _d.sent();
                role = membershipResult.rows[0].role;
                accessToken = (0, tokens_js_1.signAccessToken)({ sub: user.id, orgId: org.id, role: role });
                refreshToken = (0, tokens_js_1.generateRefreshToken)();
                refreshHash = (0, tokens_js_1.hashToken)(refreshToken);
                days = Number((_b = process.env.REFRESH_TOKEN_TTL_DAYS) !== null && _b !== void 0 ? _b : 14);
                expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
                return [4 /*yield*/, client.query("INSERT INTO refresh_sessions (user_id, org_id, token_hash, expires_at, ip, user_agent)\n       VALUES ($1, $2, $3, $4, $5, $6)", [user.id, org.id, refreshHash, expiresAt, req.ip, (_c = req.get("user-agent")) !== null && _c !== void 0 ? _c : null])];
            case 10:
                _d.sent();
                return [4 /*yield*/, client.query("COMMIT")];
            case 11:
                _d.sent();
                res.cookie("refresh_token", refreshToken, (0, tokens_js_1.refreshCookieOptions)());
                return [2 /*return*/, res.status(201).json({
                        user: { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name },
                        org: org,
                        role: role,
                        accessToken: accessToken,
                    })];
            case 12:
                e_1 = _d.sent();
                return [4 /*yield*/, client.query("ROLLBACK")];
            case 13:
                _d.sent();
                if ((e_1 === null || e_1 === void 0 ? void 0 : e_1.code) === "23505" && (e_1 === null || e_1 === void 0 ? void 0 : e_1.constraint) === "users_email_key") {
                    return [2 /*return*/, res.status(409).json({ error: "Email already exists" })];
                }
                if ((e_1 === null || e_1 === void 0 ? void 0 : e_1.code) === "23505")
                    return [2 /*return*/, res.status(409).json({ error: "Conflict" })];
                console.error(e_1);
                return [2 /*return*/, res.status(500).json({ error: "Server error" })];
            case 14:
                client.release();
                return [7 /*endfinally*/];
            case 15: return [2 /*return*/];
        }
    });
}); });
/**
 * POST /auth/login
 * - verifies password
 * - selects org (if multiple memberships)
 * - issues access token + refresh cookie
 */
app.post("/auth/login", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var parsed, _a, email, password, orgId, normalizedEmail, ip, ipKey, ipEmailKey, emailKey, ipAttempt, userResult, user, _b, ipEmailAttempt, emailAttempt, ok, _c, ipEmailAttempt, emailAttempt, e_2, memberships, chosen, match, accessToken, refreshToken, refreshHash, days, expiresAt;
    var _d, _e, _f;
    return __generator(this, function (_g) {
        switch (_g.label) {
            case 0:
                parsed = registerSchema_js_1.loginSchema.safeParse(req.body);
                if (!parsed.success)
                    return [2 /*return*/, res.status(400).json({ error: parsed.error.flatten() })];
                _a = parsed.data, email = _a.email, password = _a.password, orgId = _a.orgId;
                normalizedEmail = email.toLowerCase().trim();
                ip = (_d = req.ip) !== null && _d !== void 0 ? _d : "unknown";
                ipKey = (0, loginRateLimit_js_1.buildIpKey)(ip);
                ipEmailKey = (0, loginRateLimit_js_1.buildIpEmailKey)(ip, normalizedEmail);
                emailKey = (0, loginRateLimit_js_1.buildEmailKey)(normalizedEmail);
                return [4 /*yield*/, (0, loginRateLimit_js_1.hitLoginRateLimit)(ipKey, loginLimitRules.ip)];
            case 1:
                ipAttempt = _g.sent();
                if (ipAttempt.limited) {
                    return [2 /*return*/, sendLoginRateLimited(res, ipAttempt.retryAfterSec)];
                }
                return [4 /*yield*/, db_js_1.pool.query("SELECT id, email, password_hash, first_name, last_name\n     FROM users\n     WHERE email = $1", [normalizedEmail])];
            case 2:
                userResult = _g.sent();
                user = userResult.rows[0];
                if (!!user) return [3 /*break*/, 4];
                return [4 /*yield*/, Promise.all([
                        (0, loginRateLimit_js_1.hitLoginRateLimit)(ipEmailKey, loginLimitRules.ipEmail),
                        (0, loginRateLimit_js_1.hitLoginRateLimit)(emailKey, loginLimitRules.email),
                    ])];
            case 3:
                _b = _g.sent(), ipEmailAttempt = _b[0], emailAttempt = _b[1];
                if (ipEmailAttempt.limited || emailAttempt.limited) {
                    return [2 /*return*/, sendLoginRateLimited(res, Math.max(ipEmailAttempt.retryAfterSec, emailAttempt.retryAfterSec))];
                }
                return [2 /*return*/, res.status(401).json({ error: "Invalid credentials" })];
            case 4: return [4 /*yield*/, bcryptjs_1.default.compare(password, user.password_hash)];
            case 5:
                ok = _g.sent();
                if (!!ok) return [3 /*break*/, 7];
                return [4 /*yield*/, Promise.all([
                        (0, loginRateLimit_js_1.hitLoginRateLimit)(ipEmailKey, loginLimitRules.ipEmail),
                        (0, loginRateLimit_js_1.hitLoginRateLimit)(emailKey, loginLimitRules.email),
                    ])];
            case 6:
                _c = _g.sent(), ipEmailAttempt = _c[0], emailAttempt = _c[1];
                if (ipEmailAttempt.limited || emailAttempt.limited) {
                    return [2 /*return*/, sendLoginRateLimited(res, Math.max(ipEmailAttempt.retryAfterSec, emailAttempt.retryAfterSec))];
                }
                return [2 /*return*/, res.status(401).json({ error: "Invalid credentials" })];
            case 7:
                _g.trys.push([7, 9, , 10]);
                return [4 /*yield*/, Promise.all([
                        (0, loginRateLimit_js_1.clearLoginRateLimitKey)(ipEmailKey),
                        (0, loginRateLimit_js_1.clearLoginRateLimitKey)(emailKey),
                    ])];
            case 8:
                _g.sent();
                return [3 /*break*/, 10];
            case 9:
                e_2 = _g.sent();
                // Failed cleanup should not block a valid login.
                console.error(e_2);
                return [3 /*break*/, 10];
            case 10: return [4 /*yield*/, db_js_1.pool.query("SELECT m.org_id, m.role, o.name\n     FROM memberships m\n     JOIN orgs o ON o.id = m.org_id\n     WHERE m.user_id = $1\n     ORDER BY o.created_at ASC", [user.id])];
            case 11:
                memberships = _g.sent();
                if (memberships.rowCount === 0)
                    return [2 /*return*/, res.status(403).json({ error: "No org membership" })];
                chosen = memberships.rows[0];
                if ((memberships === null || memberships === void 0 ? void 0 : memberships.rowCount) && memberships.rowCount > 1) {
                    if (!orgId) {
                        return [2 /*return*/, res.status(200).json({
                                needsOrgSelection: true,
                                orgs: memberships.rows.map(function (m) { return ({ orgId: m.org_id, orgName: m.name, role: m.role }); }),
                            })];
                    }
                    match = memberships.rows.find(function (m) { return m.org_id === orgId; });
                    if (!match)
                        return [2 /*return*/, res.status(403).json({ error: "Not a member of that org" })];
                    chosen = match;
                }
                accessToken = (0, tokens_js_1.signAccessToken)({ sub: user.id, orgId: chosen.org_id, role: chosen.role });
                refreshToken = (0, tokens_js_1.generateRefreshToken)();
                refreshHash = (0, tokens_js_1.hashToken)(refreshToken);
                days = Number((_e = process.env.REFRESH_TOKEN_TTL_DAYS) !== null && _e !== void 0 ? _e : 14);
                expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
                return [4 /*yield*/, db_js_1.pool.query("INSERT INTO refresh_sessions (user_id, org_id, token_hash, expires_at, ip, user_agent)\n     VALUES ($1, $2, $3, $4, $5, $6)", [user.id, chosen.org_id, refreshHash, expiresAt, req.ip, (_f = req.get("user-agent")) !== null && _f !== void 0 ? _f : null])];
            case 12:
                _g.sent();
                res.cookie("refresh_token", refreshToken, (0, tokens_js_1.refreshCookieOptions)());
                return [2 /*return*/, res.json({
                        user: { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name },
                        org: { id: chosen.org_id, name: chosen.name },
                        role: chosen.role,
                        accessToken: accessToken,
                    })];
        }
    });
}); });
app.post("/auth/refresh", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var refreshToken, tokenHash, refresh_token_sess, _a, user_id, org_id, expires_at, member, memberRole, newRefreshToken, newHashRefreshToken, accessToken;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                refreshToken = (_b = req.cookies) === null || _b === void 0 ? void 0 : _b.refresh_token;
                if (!refreshToken)
                    return [2 /*return*/, res.status(401).json({ code: "NO_REFRESH", error: "Missing refresh token" })];
                tokenHash = (0, tokens_js_1.hashToken)(refreshToken);
                return [4 /*yield*/, db_js_1.pool.query("SELECT user_id, org_id, expires_at\n         FROM refresh_sessions\n         WHERE token_hash = $1", [tokenHash])];
            case 1:
                refresh_token_sess = _c.sent();
                if (refresh_token_sess.rowCount === 0)
                    return [2 /*return*/, res.status(401).json({ code: "INVALID_REFRESH", error: "Invalid refresh token" })];
                _a = refresh_token_sess.rows[0], user_id = _a.user_id, org_id = _a.org_id, expires_at = _a.expires_at;
                if (new Date(expires_at) <= new Date()) {
                    return [2 /*return*/, res.status(401).json({ code: "REFRESH_EXPIRED", error: "Refresh token expired" })];
                }
                return [4 /*yield*/, db_js_1.pool.query("SELECT role FROM memberships WHERE user_id = $1 AND org_id = $2", [user_id, org_id])];
            case 2:
                member = _c.sent();
                if (!(member.rowCount === 0)) return [3 /*break*/, 4];
                // optional: delete this refresh session here
                return [4 /*yield*/, db_js_1.pool.query("DELETE FROM refresh_sessions WHERE token_hash = $1", [tokenHash])];
            case 3:
                // optional: delete this refresh session here
                _c.sent();
                return [2 /*return*/, res.status(401).json({ code: "NO_MEMBERSHIP", error: "No longer a member of this org" })];
            case 4:
                memberRole = member.rows[0].role;
                newRefreshToken = (0, tokens_js_1.generateRefreshToken)();
                newHashRefreshToken = (0, tokens_js_1.hashToken)(newRefreshToken);
                return [4 /*yield*/, db_js_1.pool.query("UPDATE refresh_sessions\n         SET token_hash = $1\n         WHERE token_hash = $2", [newHashRefreshToken, tokenHash])];
            case 5:
                _c.sent();
                accessToken = (0, tokens_js_1.signAccessToken)({ sub: user_id, orgId: org_id, role: memberRole });
                res.cookie("refresh_token", newRefreshToken, (0, tokens_js_1.refreshCookieOptions)());
                return [2 /*return*/, res.json({ accessToken: accessToken })];
        }
    });
}); });
app.post("/auth/logout", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var refreshToken, tokenHash, e_3, cookieOptions;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                refreshToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refresh_token;
                if (!refreshToken) return [3 /*break*/, 4];
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                tokenHash = (0, tokens_js_1.hashToken)(refreshToken);
                return [4 /*yield*/, db_js_1.pool.query("DELETE FROM refresh_sessions WHERE token_hash = $1", [tokenHash])];
            case 2:
                _b.sent();
                return [3 /*break*/, 4];
            case 3:
                e_3 = _b.sent();
                console.error(e_3);
                return [3 /*break*/, 4];
            case 4:
                cookieOptions = (0, tokens_js_1.refreshCookieOptions)();
                res.clearCookie("refresh_token", {
                    httpOnly: cookieOptions.httpOnly,
                    sameSite: cookieOptions.sameSite,
                    secure: cookieOptions.secure,
                    path: cookieOptions.path,
                });
                return [2 /*return*/, res.json({ ok: true })];
        }
    });
}); });
app.get("/me", authMiddleware_js_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, userId, orgId, role, userRes;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.auth, userId = _a.sub, orgId = _a.orgId, role = _a.role;
                return [4 /*yield*/, db_js_1.pool.query("SELECT id, email, first_name, last_name\n         FROM users\n         WHERE id = $1", [userId])];
            case 1:
                userRes = _b.sent();
                if (userRes.rowCount === 0)
                    return [2 /*return*/, res.status(404).json({ error: "User not found" })];
                return [2 /*return*/, res.json({
                        user: userRes.rows[0],
                        activeOrg: { id: orgId },
                        role: role,
                    })];
        }
    });
}); });
var port = Number((_a = process.env.PORT) !== null && _a !== void 0 ? _a : 4001);
app.listen(port, function () { return console.log("[auth-service] listening on :".concat(port)); });
