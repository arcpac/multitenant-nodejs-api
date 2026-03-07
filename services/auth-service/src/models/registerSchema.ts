import { z } from "zod";

export const registerSchema = z.object({
    email: z.email(),
    password: z.string().min(3),
    orgName: z.string().min(2),
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
});

export const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(1),
    orgId: z.uuid().optional(),
});
