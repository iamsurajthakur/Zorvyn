import z from "zod"

export const userRoleEnum = z.enum(['VIEWER','ANALYST','ADMIN'])

export const createUserSchema = z.object({
    name: z.string().min(2).max(50),

    email: z.email().transform((val) => val.toLowerCase()),

    password: z
        .string()
        .min(8)
        .max(100)
        .regex(/[A-Z]/, "Must include uppercase letter")
        .regex(/[0-9]/, "Must include a number"),

    role: userRoleEnum.default('VIEWER'),

    isActive: z.boolean().optional().default(true)
})