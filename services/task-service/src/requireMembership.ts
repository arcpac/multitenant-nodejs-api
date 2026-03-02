import { pool } from "./db.js";

export async function requireMembership(req: any, res: any, next: any) {
    const { sub: userId, orgId } = req.auth;

    const q = `
    select 1
    from memberships
    where user_id = $1
      and org_id = $2
    limit 1
  `;

    const r = await pool.query(q, [userId, orgId]);

    if (r.rowCount === 0) {
        return res.status(403).json({ error: "Not a member of this org" });
    }

    next();
}