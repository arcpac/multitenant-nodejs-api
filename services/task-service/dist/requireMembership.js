import { pool } from "./db.js";
export async function requireMembership(req, res, next) {
    const { sub: userId, orgId } = req.auth;
    const q = `
    select role
    from memberships
    where user_id = $1
      and org_id = $2
    limit 1
  `;
    const r = await pool.query(q, [userId, orgId]);
    const role = r.rows[0].role;
    req.member = { userId, orgId, role };
    if (r.rowCount === 0)
        return res.status(403).json({ error: "Not a member of this org" });
    req.auth.role = role;
    next();
}
