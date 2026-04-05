import { z } from 'zod'

//Reusable Date Range
const dateRangeSchema = {
  from: z
    .iso.datetime({ message: 'Invalid date. Use ISO 8601' })
    .transform((val) => new Date(val))
    .optional(),
  to: z
    .iso.datetime({ message: 'Invalid date. Use ISO 8601' })
    .transform((val) => new Date(val))
    .optional(),
}

//Reusable Date Range Refinement
const validateDateRange = (data) => {
  if (data.from && data.to) return data.from <= data.to
  return true
}

const dateRangeError = {
  message: 'from date must be before to date',
  path: ['from'],
}

//Summary Schema
export const summaryQuerySchema = z.object({
  query: z
    .object({ ...dateRangeSchema })
    .refine(validateDateRange, dateRangeError)
})

//Category Breakdown Schema 
export const categoryQuerySchema = z.object({
  query: z
    .object({
      ...dateRangeSchema,
      type: z.enum(['INCOME', 'EXPENSE']).optional(),  // filter by type
    })
    .refine(validateDateRange, dateRangeError)
})

//Trends Schema
export const trendsQuerySchema = z.object({
  query: z
    .object({
      ...dateRangeSchema,
      groupBy: z.enum(['month', 'week']).default('month'),  // monthly or weekly
    })
    .refine(validateDateRange, dateRangeError)
})

//Recent Activity Schema
export const recentActivityQuerySchema = z.object({
  query: z.object({
    limit: z.coerce.number().min(1).max(20).default(10),
  })
})