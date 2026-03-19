import { z } from 'zod'
const Visibility = z.enum(["TEAM_ONLY", "ORG_VISIBLE", "PRIVATE"])
const Status = z.enum(["TODO", "DOING", "DONE"])

export const createTaskSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    teamId: z.uuid().nullable().optional(),
    assignedToUserId: z.uuid().nullable().optional(),
    visibility: Visibility.default("ORG_VISIBLE"),
    status: Status.default("TODO")
})

export const updateTaskSchema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    teamId: z.uuid().nullable().optional(),
    assignedToUserId: z.uuid().nullable().optional(),
    visibility: Visibility.optional(),
    status: Status.optional(),
});

export const batchDeletionTasksSchema = z.object({
    taskIds: z.array(z.uuid()).min(1).max(20).transform((ids) => [...new Set(ids)])
})

export const aiTaskPlanRequestSchema = z.object({
    goal: z.string().trim().min(3).max(500),
});

export const createManyTasksSchema = z.object({
    tasks: z.array(createTaskSchema).min(1).max(20),
});
