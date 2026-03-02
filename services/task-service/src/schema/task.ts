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

