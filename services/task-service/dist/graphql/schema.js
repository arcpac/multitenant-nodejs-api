import { createSchema } from "graphql-yoga";
import { GraphQLError } from "graphql";
import { DateResolver, DateTimeResolver, DateTimeTypeDefinition, DateTypeDefinition } from "graphql-scalars";
import { pool } from "../db.js";
const typeDefs = `
  ${DateTypeDefinition}
  ${DateTimeTypeDefinition}

  enum TaskVisibility { TEAM_ONLY ORG_VISIBLE PRIVATE }
  enum TaskStatus { TODO DOING DONE }
  enum Priority { LOW MEDIUM HIGH URGENT }

  input TaskFilter {
    teamId: ID
    status: TaskStatus
    mine: Boolean
  }

  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
  }

  type Team {
    id: ID!
    name: String!
    orgId: String!
  }

  type Org {
    id: ID!
    name: String!
  }

  type OrgMember {
    id: ID!
    email: String!
    firstName: String
    lastName: String
    role: String!
    orgName: String!
  }

  type Me {
    user: User!
    activeOrg: Org!
    role: String!
    members: [OrgMember!]!
  }

  type Task {
    id: ID!
    title: String!
    description: String
    status: TaskStatus!
    visibility: TaskVisibility!
    priority: Priority!
    dueDate: Date
    createdAt: DateTime!
    updatedAt: DateTime!

    assignee: User
    team: Team
  }

  type TaskCounts {
    total: Int!
    todo: Int!
    doing: Int!
    done: Int!
  }

  type Dashboard {
    teams: [Team!]!
    counts: TaskCounts!
    tasks: [Task!]!
  }

  type Query {
    me: Me!
    dashboard(filter: TaskFilter): Dashboard!
    tasks(filter: TaskFilter): [Task!]!
    taskCounts(filter: TaskFilter): TaskCounts!
    teams: [Team!]!
  }
`;
function makeCounts(rows) {
    const counts = { total: 0, todo: 0, doing: 0, done: 0 };
    for (const r of rows) {
        counts.total += Number(r.count);
        if (r.status === "TODO")
            counts.todo = Number(r.count);
        if (r.status === "DOING")
            counts.doing = Number(r.count);
        if (r.status === "DONE")
            counts.done = Number(r.count);
    }
    return counts;
}
async function ensureMembership(userId, orgId) {
    const r = await pool.query(`select 1 from memberships where user_id = $1 and org_id = $2 limit 1`, [userId, orgId]);
    if (r.rowCount === 0) {
        throw new GraphQLError("Not a member of this org", {
            extensions: { code: "FORBIDDEN" },
        });
    }
}
function buildVisibleTasksSql(opts) {
    const { orgId, userId } = opts;
    const filter = opts.filter ?? {};
    const params = [orgId, userId];
    let i = 2;
    let where = `
    t.org_id = $1
    and (
      t.visibility = 'ORG_VISIBLE'
      or (t.visibility = 'PRIVATE' and t.created_by = $2)
      or (
        t.visibility = 'TEAM_ONLY'
        and (
          t.created_by = $2
          or t.assigned_to_user_id = $2
          or (
            t.team_id is not null
            and exists (
              select 1 from team_members tm
              where tm.team_id = t.team_id and tm.user_id = $2
            )
          )
        )
      )
    )
  `;
    if (filter.mine) {
        where += ` and (t.created_by = $2 or t.assigned_to_user_id = $2)`;
    }
    if (filter.teamId) {
        params.push(filter.teamId);
        where += ` and t.team_id = $${++i}`;
    }
    if (filter.status) {
        params.push(filter.status);
        where += ` and t.status = $${++i}`;
    }
    if (opts.forCounts) {
        return {
            sql: `
        select t.status, count(*)::int as count
        from tasks t
        where ${where}
        group by t.status
      `,
            params,
        };
    }
    return {
        sql: `
      select
        t.id,
        t.title,
        t.description,
        t.status,
        t.visibility,
        t.team_id,
        t.assigned_to_user_id,
        t.priority,
        t.due_date as "dueDate",
        t.created_at,
        t.updated_at
      from tasks t
      where ${where}
      order by t.created_at desc
    `,
        params,
    };
}
export const schema = createSchema({
    typeDefs: [typeDefs],
    resolvers: [
        {
            Date: DateResolver,
            DateTime: DateTimeResolver,
            Task: {
                assignee: (task, _args, ctx) => {
                    if (!task.assigned_to_user_id)
                        return null;
                    return ctx.loaders.userById.load(task.assigned_to_user_id);
                },
                team: (task, _args, ctx) => {
                    if (!task.team_id)
                        return null;
                    return ctx.loaders.teamById.load(task.team_id);
                },
                createdAt: (t) => t.created_at,
                updatedAt: (t) => t.updated_at,
            },
            Query: {
                me: async (_, _args, ctx) => {
                    const [userR, membersR, orgR] = await Promise.all([
                        pool.query(`select id, email, first_name as "firstName", last_name as "lastName"
                             from users
                             where id = $1
                             limit 1`, [ctx.auth.sub]),
                        pool.query(`
                              select
                                u.id,
                                u.email,
                                u.first_name as "firstName",
                                u.last_name as "lastName",
                                m.role,
                                o.name as "orgName"
                              from memberships m
                              join users u on u.id = m.user_id
                              join orgs o on o.id = m.org_id
                              where m.org_id = $1
                              order by
                                case when u.last_name is null or u.last_name = '' then 1 else 0 end,
                                u.last_name asc nulls last,
                                u.first_name asc nulls last,
                                u.email asc
                            `, [ctx.auth.orgId]),
                        pool.query(`select id, name
                             from orgs
                             where id = $1
                             limit 1`, [ctx.auth.orgId]),
                    ]);
                    if (userR.rowCount === 0) {
                        throw new GraphQLError("User not found", {
                            extensions: { code: "NOT_FOUND" },
                        });
                    }
                    if (orgR.rowCount === 0) {
                        throw new GraphQLError("Org not found", {
                            extensions: { code: "NOT_FOUND" },
                        });
                    }
                    return {
                        user: userR.rows[0],
                        activeOrg: { id: ctx.auth.orgId, name: orgR.rows[0].name },
                        role: ctx.auth.role,
                        members: membersR.rows,
                    };
                },
                teams: async (_, _args, ctx) => {
                    const r = await pool.query(`select id, name from teams where org_id = $1 order by name asc`, [ctx.auth.orgId]);
                    return r.rows;
                },
                tasks: async (_, args, ctx) => {
                    const { sql, params } = buildVisibleTasksSql({
                        orgId: ctx.auth.orgId,
                        userId: ctx.auth.sub,
                        filter: args.filter ?? {},
                    });
                    const r = await pool.query(sql, params);
                    return r.rows;
                },
                taskCounts: async (_, args, ctx) => {
                    const { sql, params } = buildVisibleTasksSql({
                        orgId: ctx.auth.orgId,
                        userId: ctx.auth.sub,
                        filter: args.filter ?? {},
                        forCounts: true,
                    });
                    const r = await pool.query(sql, params);
                    return makeCounts(r.rows);
                },
                dashboard: async (_, args, ctx) => {
                    const filter = args.filter ?? {};
                    const teamsQ = pool.query(`select id, name from teams where org_id = $1 order by name asc`, [ctx.auth.orgId]);
                    const tasksQ = pool.query(buildVisibleTasksSql({
                        orgId: ctx.auth.orgId,
                        userId: ctx.auth.sub,
                        filter,
                    }).sql, buildVisibleTasksSql({
                        orgId: ctx.auth.orgId,
                        userId: ctx.auth.sub,
                        filter,
                    }).params);
                    const countsQ = pool.query(buildVisibleTasksSql({
                        orgId: ctx.auth.orgId,
                        userId: ctx.auth.sub,
                        filter,
                        forCounts: true,
                    }).sql, buildVisibleTasksSql({
                        orgId: ctx.auth.orgId,
                        userId: ctx.auth.sub,
                        filter,
                        forCounts: true,
                    }).params);
                    const [teamsR, tasksR, countsR] = await Promise.all([teamsQ, tasksQ, countsQ]);
                    return {
                        teams: teamsR.rows,
                        tasks: tasksR.rows,
                        counts: makeCounts(countsR.rows),
                    };
                },
            },
        },
    ],
});
