import z from "zod"
import { objectIdSchema } from "./common.schema.js"

export const userRoleEnum = z.enum(['VIEWER','ANALYST','ADMIN'])

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50),
    email: z.string().email().transform((val) => val.toLowerCase()),
    password: z
      .string()
      .min(8)
      .max(100)
      .regex(/[A-Z]/, 'Must include uppercase letter')
      .regex(/[0-9]/, 'Must include a number'),
    role: userRoleEnum.default('VIEWER'),
    isActive: z.boolean().default(true),
  }),
})

export const updateRoleSchema = z.object({
    params: z.object({
        id: objectIdSchema
    }),
    body: z.object({
        role: userRoleEnum,
    }),
})

export const updateStatusSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    isActive: z.boolean(),
  }),
})

export const userIdParamSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
})

export const getUsersQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    role: userRoleEnum.optional(),
    isActive: z.coerce.boolean().optional(),
  }),
})