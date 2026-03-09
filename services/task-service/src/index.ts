import "dotenv/config";
import express from "express";
import cors from "cors";
import { pool } from "./db.js";
import { requireAuth } from "./authMiddleware.js";
import { requireMembership } from "./requireMembership.js";
import { createTaskSchema, updateTaskSchema } from "./schema/task.js";

import { createYoga } from "graphql-yoga";
import { schema } from "./graphql/schema.js";
import { getAuthFromAuthorizationHeader } from "./auth.js";
import DataLoader from "dataloader";
import { GraphQLError } from "graphql";

const app = express();
app.use(cors({ origin: true }));

const yoga = createYoga({
  schema,
  cors: false,
  graphiql: process.env.NODE_ENV !== "production",
  context: async ({ request }) => {
    const auth = getAuthFromAuthorizationHeader(request.headers.get("authorization"));

    const m = await pool.query(
      `select role
       from memberships
       where user_id = $1 and org_id = $2
       limit 1`,
      [auth.sub, auth.orgId]
    );

    if (m.rowCount === 0) {
      throw new GraphQLError("Not a member of this org", {
        extensions: { code: "FORBIDDEN" },
      });
    }
    const dbRole = m.rows[0].role;
    auth.role = dbRole;

    const userById = new DataLoader<string, any | null>(async (ids) => {
      const r = await pool.query(
        `select id, email, first_name as "firstName", last_name as "lastName"
         from users
         where id = any($1::uuid[])`,
        [ids]
      );
      const map = new Map(r.rows.map((u: any) => [u.id, u]));
      return ids.map((id) => map.get(id) ?? null);
    });

    const teamById = new DataLoader<string, any | null>(async (ids) => {
      const r = await pool.query(
        `select id, name
         from teams
         where org_id = $1 and id = any($2::uuid[])`,
        [auth.orgId, ids]
      );
      const map = new Map(r.rows.map((t: any) => [t.id, t]));
      return ids.map((id) => map.get(id) ?? null);
    });
    console.log('userById: ', userById)
    console.log('teamById: ', teamById)

    return { auth, loaders: { userById, teamById } };
  },
});

// ⚠️ Taake note!!!! Mount Yoga BEFORE express.json() to avoid body-parser edge cases.
app.use("/graphql", yoga);
app.use(express.json());

app.get("/health", async (_req, res) => {
  const r = await pool.query("select 1 as ok");
  res.json({ ok: true, service: "task-service", db: r.rows[0].ok === 1 });
});

app.use(requireAuth, requireMembership);

app.get("/members", async (req: any, res) => {
  const { orgId } = req.auth;

  const r = await pool.query(
    `
      select
        u.id,
        u.email,
        u.first_name as "firstName",
        u.last_name as "lastName",
        m.role
      from memberships m
      join users u on u.id = m.user_id
      where m.org_id = $1
      order by
        case when u.last_name is null or u.last_name = '' then 1 else 0 end,
        u.last_name asc nulls last,
        u.first_name asc nulls last,
        u.email asc
    `,
    [orgId]
  );

  res.json({ members: r.rows });
});


app.post("/tasks", async (req: any, res) => {
  const { sub: userId, orgId } = req.auth;

  const parsed = createTaskSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { title, description, teamId, assignedToUserId, visibility, status } = parsed.data;

  if (visibility === "TEAM_ONLY" && !teamId) {
    return res.status(400).json({ error: "TEAM_ONLY tasks must include teamId" });
  }

  if (teamId) {
    const t = await pool.query(`select 1 from teams where id = $1 and org_id = $2`, [teamId, orgId]);
    if (t.rowCount === 0) return res.status(400).json({ error: "Invalid teamId for this org" });
  }

  if (assignedToUserId) {
    const a = await pool.query(
      `select 1 from memberships where user_id = $1 and org_id = $2`,
      [assignedToUserId, orgId]
    );
    if (a.rowCount === 0) return res.status(400).json({ error: "Assignee is not in this org" });
  }

  const r = await pool.query(
    `
      insert into tasks (org_id, team_id, created_by, assigned_to_user_id, visibility, status, title, description)
      values ($1,$2,$3,$4,$5,$6,$7,$8)
      returning *
      `,
    [orgId, teamId ?? null, userId, assignedToUserId ?? null, visibility, status, title, description ?? null]
  );

  res.status(201).json({ task: r.rows[0] });
});

app.patch("/tasks/:id", async (req: any, res) => {
  const { sub: userId, orgId } = req.auth;
  const role = req.member.role;
  const taskId = req.params.id;

  const parsed = updateTaskSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const existing = await pool.query(`select * from tasks where id = $1 and org_id = $2`, [taskId, orgId]);
  if (existing.rowCount === 0) return res.status(404).json({ error: "Task not found" });

  const task = existing.rows[0];
  const canEdit = task.created_by === userId || ["OWNER", "ADMIN"].includes(role);
  if (!canEdit) return res.status(403).json({ error: "Forbidden" });

  const p = parsed.data;

  // Validity checks
  // is team only
  // is the teamId belongs to Org?
  // is the assignedToUserId belongs to Org?
  const nextVisibility = p.visibility ?? task.visibility;
  const nextTeamId =
    p.teamId !== undefined ? p.teamId : task.team_id;
  const nextAssignee =
    p.assignedToUserId !== undefined ? p.assignedToUserId : task.assigned_to_user_id;


  if (nextVisibility === "TEAM_ONLY" && !nextTeamId) {
    return res.status(400).json({ error: "TEAM_ONLY tasks must include teamId" });
  }
  if (p.teamId !== undefined && p.teamId) {
    const t = await pool.query(`select 1 from teams where id $1 and org_id $2`, [p.teamId, orgId])
    if (t.rowCount === 0) return res.status(400).json({ error: "Invalid teamId for this org" });
  }
  if (p.assignedToUserId !== undefined && p.assignedToUserId) {
    const a = await pool.query(
      `select 1 from memberships where user_id = $1 and org_id = $2`,
      [p.assignedToUserId, orgId]
    );
    if (a.rowCount === 0) return res.status(400).json({ error: "Assignee is not in this org" });
  }

  const fields: string[] = [];
  const values: any[] = [];
  let i = 0;

  const set = (col: string, val: any) => {
    values.push(val);
    fields.push(`${col} = $${++i}`);
  };

  if (p.title !== undefined) set("title", p.title);
  if (p.description !== undefined) set("description", p.description);
  if (p.status !== undefined) set("status", p.status);
  if (p.visibility !== undefined) set("visibility", p.visibility);
  if (p.teamId !== undefined) set("team_id", p.teamId);
  if (p.assignedToUserId !== undefined) set("assigned_to_user_id", p.assignedToUserId);

  set("updated_at", new Date());

  values.push(taskId, orgId);
  const sql = `
      update tasks
      set ${fields.join(", ")}
      where id = $${++i} and org_id = $${++i}
      returning *
    `;

  const r = await pool.query(sql, values);
  res.json({ task: r.rows[0] });
});

app.delete("/tasks/:id", async (req: any, res) => {
  const { sub: userId, orgId } = req.auth;
  const role = req.member.role;

  const taskId = req.params.id;

  const existing = await pool.query(`select * from tasks where id = $1 and org_id = $2`, [taskId, orgId]);
  if (existing.rowCount === 0) return res.status(404).json({ error: "Task not found" });

  const task = existing.rows[0];
  const canDelete = task.created_by === userId || ["OWNER", "ADMIN"].includes(role);
  if (!canDelete) return res.status(403).json({ error: "Forbidden" });

  await pool.query(`delete from tasks where id = $1 and org_id = $2`, [taskId, orgId]);
  res.status(204).send();
});

const port = Number(process.env.PORT ?? 4002);
app.listen(port, () => console.log(`[task-service] listening on :${port}`));
