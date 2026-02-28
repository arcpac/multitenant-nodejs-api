import { pool } from "./db.js";

export async function requireMembership(req: any, res: any, next: any) {
    const { sub: userId, orgId } = req.auth;
    const result = await pool.query(
        `
        SELECT 1 FROM membershios where user_id = $1 and org_id $2
        `, [userId, orgId]
    )
    if (result.rowCount === 0) return res.status(403).json({ error: "Not a member of this org" });
    next();
}