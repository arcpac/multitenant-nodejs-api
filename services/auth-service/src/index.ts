import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import bcrypt from "bcryptjs";
import { pool } from "./db.js";
import {
    signAccessToken,
    generateRefreshToken,
    hashToken,
    refreshCookieOptions,
} from "./tokens.js";
import { loginSchema, registerSchema } from "./models/registerSchema.js";
import { requireAuth } from "./authMiddleware.js";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());


app.get("/health", async (_req, res) => {
    const r = await pool.query("select 1 as ok");
    res.json({ ok: true, service: "auth-service", db: r.rows[0].ok === 1 });
});

/**
 * POST /auth/register
 * Creates:
 * - users row
 * - orgs row
 * - memberships row (OWNER)
 * - refresh_sessions row (stores refresh token hash)
 * Returns:
 * - accessToken (JWT)
 * - refresh_token cookie (httpOnly)
 */
app.post("/auth/register", async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const { email, password, orgName, firstName, lastName } = parsed.data;
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const passwordHash = await bcrypt.hash(password, 12);

        const userResult = await client.query(
            `INSERT INTO users (email, password_hash, first_name, last_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, first_name, last_name`,
            [email.toLowerCase(), passwordHash, firstName ?? null, lastName ?? null]
        );


        const orgResult = await client.query(
            `INSERT INTO orgs (name) VALUES ($1) RETURNING id, name`,
            [orgName]
        );

        const user = userResult.rows[0];
        const org = orgResult.rows[0];

        const membershipResult = await client.query(
            `INSERT INTO memberships (user_id, org_id, role)
       VALUES ($1, $2, 'OWNER')
       RETURNING role`,
            [user.id, org.id]
        );

        const role = membershipResult.rows[0].role as string;

        // Issue tokens
        const accessToken = signAccessToken({ sub: user.id, orgId: org.id, role });

        const refreshToken = generateRefreshToken();
        const refreshHash = hashToken(refreshToken);

        const days = Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 14);
        const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

        await client.query(
            `INSERT INTO refresh_sessions (user_id, org_id, token_hash, expires_at, ip, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6)`,
            [user.id, org.id, refreshHash, expiresAt, req.ip, req.get("user-agent") ?? null]
        );

        await client.query("COMMIT");

        res.cookie("refresh_token", refreshToken, refreshCookieOptions());
        return res.status(201).json({
            user: { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name },
            org,
            role,
            accessToken,
        });
    } catch (e: any) {
        await client.query("ROLLBACK");
        if (e?.code === "23505") return res.status(409).json({ error: "Email already exists" });
        console.error(e);
        return res.status(500).json({ error: "Server error" });
    } finally {
        client.release();
    }
});

/**
 * POST /auth/login
 * - verifies password
 * - selects org (if multiple memberships)
 * - issues access token + refresh cookie
 */
app.post("/auth/login", async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const { email, password, orgId } = parsed.data;

    const userResult = await pool.query(
        `SELECT id, email, password_hash, first_name, last_name
     FROM users
     WHERE email = $1`,
        [email.toLowerCase()]
    );

    const user = userResult.rows[0];
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const memberships = await pool.query(
        `SELECT m.org_id, m.role, o.name
     FROM memberships m
     JOIN orgs o ON o.id = m.org_id
     WHERE m.user_id = $1
     ORDER BY o.created_at ASC`,
        [user.id]
    );

    if (memberships.rowCount === 0) return res.status(403).json({ error: "No org membership" });

    let chosen = memberships.rows[0];
    if (memberships.rowCount > 1) {
        if (!orgId) {
            return res.status(200).json({
                needsOrgSelection: true,
                orgs: memberships.rows.map((m) => ({ orgId: m.org_id, orgName: m.name, role: m.role })),
            });
        }
        const match = memberships.rows.find((m) => m.org_id === orgId);
        if (!match) return res.status(403).json({ error: "Not a member of that org" });
        chosen = match;
    }

    const accessToken = signAccessToken({ sub: user.id, orgId: chosen.org_id, role: chosen.role });

    const refreshToken = generateRefreshToken();
    const refreshHash = hashToken(refreshToken);
    const days = Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 14);
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    await pool.query(
        `INSERT INTO refresh_sessions (user_id, org_id, token_hash, expires_at, ip, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6)`,
        [user.id, chosen.org_id, refreshHash, expiresAt, req.ip, req.get("user-agent") ?? null]
    );

    res.cookie("refresh_token", refreshToken, refreshCookieOptions());
    return res.json({
        user: { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name },
        org: { id: chosen.org_id, name: chosen.name },
        role: chosen.role,
        accessToken,
    });
});

app.post("/auth/refresh", async (req, res) => {
    const refreshToken = req.cookies?.refresh_token;
    console.log('cookies => ', req.cookies)
    // 2ba2812757d0c54892eb1fe356105a684859a48d6b776197d079f34dcf2e30b7
    if (!refreshToken) return res.status(401).json({ code: "NO_REFRESH", error: "Missing refresh token" })

    const tokenHash = hashToken(refreshToken)
    const refresh_token_sess = await pool.query(
        `SELECT user_id, org_id, expires_at
         FROM refresh_sessions
         WHERE token_hash = $1`,
        [tokenHash]
    );

    if (refresh_token_sess.rowCount === 0) return res.status(401).json({ code: "INVALID_REFRESH", error: "Invalid refresh token" })

    const { user_id, org_id, expires_at } = refresh_token_sess.rows[0];
    if (new Date(expires_at) <= new Date()) {
        return res.status(401).json({ code: "REFRESH_EXPIRED", error: "Refresh token expired" });

    }
    const member = await pool.query(
        `SELECT role FROM memberships WHERE user_id = $1 AND org_id = $2`,
        [user_id, org_id]
    );
    if (member.rowCount === 0) {
        // optional: delete this refresh session here
        await pool.query(`DELETE FROM refresh_sessions WHERE token_hash = $1`, [tokenHash]);
        return res.status(401).json({ code: "NO_MEMBERSHIP", error: "No longer a member of this org" });
    }
    const memberRole = member.rows[0].role as string
    const newRefreshToken = generateRefreshToken();
    const newHashRefreshToken = hashToken(newRefreshToken);
    await pool.query(
        `UPDATE refresh_sessions
         SET token_hash = $1
         WHERE token_hash = $2`,
        [newHashRefreshToken, tokenHash]
    );

    const accessToken = signAccessToken({ sub: user_id, orgId: org_id, role: memberRole });

    res.cookie("refresh_token", newHashRefreshToken, refreshCookieOptions());
    return res.json({ accessToken });
})


app.get("/me", requireAuth, async (req: any, res) => {
    const { sub: userId, orgId, role } = req.auth;
    const userRes = await pool.query(
        `SELECT id, email, first_name, last_name
         FROM users
         WHERE id = $1`,
        [userId]
    );
    if (userRes.rowCount === 0) return res.status(404).json({ error: "User not found" });

    return res.json({
        user: userRes.rows[0],
        activeOrg: { id: orgId },
        role,
    });
})

const port = Number(process.env.PORT ?? 4001);
app.listen(port, () => console.log(`[auth-service] listening on :${port}`));
