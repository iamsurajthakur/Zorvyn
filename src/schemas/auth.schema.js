import { z } from 'zod'

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50),
    email: z.string().email().transform((val) => val.toLowerCase()),
    password: z
      .string()
      .min(8)
      .max(100)
      .regex(/[A-Z]/, 'Must include uppercase letter')
      .regex(/[0-9]/, 'Must include a number'),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
})

export const loginSchema = z.object({
  email: z.string().email().transform((val) => val.toLowerCase()),
  password: z.string().min(1, 'Password is required'),
})