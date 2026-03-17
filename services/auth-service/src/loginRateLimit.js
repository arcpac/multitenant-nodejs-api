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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLoginLimitRules = getLoginLimitRules;
exports.buildIpKey = buildIpKey;
exports.buildIpEmailKey = buildIpEmailKey;
exports.buildEmailKey = buildEmailKey;
exports.hitLoginRateLimit = hitLoginRateLimit;
exports.clearLoginRateLimitKey = clearLoginRateLimitKey;
var db_js_1 = require("./db.js");
function parsePositiveInt(value, fallback) {
    var parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0)
        return fallback;
    return Math.floor(parsed);
}
function getLoginLimitRules() {
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
function buildIpKey(ip) {
    return "ip:".concat(ip);
}
function buildIpEmailKey(ip, email) {
    return "ip_email:".concat(ip, ":").concat(email);
}
function buildEmailKey(email) {
    return "email:".concat(email);
}
function hitLoginRateLimit(key, rule) {
    return __awaiter(this, void 0, void 0, function () {
        var result, row, count, windowEnd, limited, retryAfterSec;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_js_1.pool.query("INSERT INTO login_rate_limits (key, count, window_end, updated_at)\n         VALUES ($1, 1, now() + ($2::int * interval '1 second'), now())\n         ON CONFLICT (key) DO UPDATE\n         SET\n           count = CASE\n             WHEN login_rate_limits.window_end <= now() THEN 1\n             ELSE login_rate_limits.count + 1\n           END,\n           window_end = CASE\n             WHEN login_rate_limits.window_end <= now() THEN now() + ($2::int * interval '1 second')\n             ELSE login_rate_limits.window_end\n           END,\n           updated_at = now()\n         RETURNING count, window_end", [key, rule.windowSec])];
                case 1:
                    result = _a.sent();
                    row = result.rows[0];
                    count = Number(row.count);
                    windowEnd = new Date(row.window_end);
                    limited = count > rule.max;
                    retryAfterSec = Math.max(1, Math.ceil((windowEnd.getTime() - Date.now()) / 1000));
                    return [2 /*return*/, {
                            limited: limited,
                            retryAfterSec: retryAfterSec,
                            remaining: Math.max(0, rule.max - count),
                        }];
            }
        });
    });
}
function clearLoginRateLimitKey(key) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_js_1.pool.query("DELETE FROM login_rate_limits WHERE key = $1", [key])];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
