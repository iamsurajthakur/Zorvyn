import z from "zod";
import { objectIdSchema } from "./common.schema.js";
import { ALL_CATEGORIES, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "../constants/categories.js";


const recordTypeEnum = z.enum(['INCOME','EXPENSE'])

const categoryEnum = z.enum(ALL_CATEGORIES)

// create record
export const createRecordSchema = z.object({
  body: z.object({
    amount: z
      .number()
      .positive('Amount must be greater than 0')
      .max(10_000_000, 'Amount too large'),

    type: recordTypeEnum,

    category: categoryEnum,

    date: z
      .iso.datetime({ message: 'Invalid date format. Use ISO 8601' })
      .transform((val) => new Date(val)),

    description: z
      .string()
      .max(500, 'Description too long')
      .optional(),
  })
  // cross field validation: category must match type
  .refine(
    (data) => {
      if (data.type === 'INCOME') {
        return INCOME_CATEGORIES.includes(data.category)
      }
      if (data.type === 'EXPENSE') {
        return EXPENSE_CATEGORIES.includes(data.category)
      }
      return true
    },
    {
      message: 'Category does not match record type',
      path: ['category'],
    }
  ),
})

// update record
export const updateRecordSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z
    .object({
      amount: z
        .number()
        .positive('Amount must be greater than 0')
        .max(10_000_000, 'Amount too large')
        .optional(),

      type: recordTypeEnum.optional(),

      category: categoryEnum.optional(),

      date: z
        .iso.datetime({ message: 'Invalid date format. Use ISO 8601' })
        .transform((val) => new Date(val))
        .optional(),

      description: z
        .string()
        .max(500, 'Description too long')
        .optional(),
    })
    // If both type and category are provided, they must match
    .refine(
      (data) => {
        if (data.type && data.category) {
          if (data.type === 'INCOME') return INCOME_CATEGORIES.includes(data.category)
          if (data.type === 'EXPENSE') return EXPENSE_CATEGORIES.includes(data.category)
        }
        return true  // if only one is provided, skip cross validation
      },
      {
        message: 'Category does not match record type',
        path: ['category'],
      }
    )
    .refine(
      (data) => Object.keys(data).length > 0,
      { message: 'At least one field must be provided for update' }
    ),
})

// record is params
export const recordIdParamSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
})

// get record query
export const getRecordsQuerySchema = z.object({
  query: z.object({
    // Pagination
    page:  z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),

    // Filters
    type:     recordTypeEnum.optional(),
    category: categoryEnum.optional(),

    // Date range
    from: z
      .iso.datetime({ message: 'Invalid date. Use ISO 8601' })
      .transform((val) => new Date(val))
      .optional(),
    to: z
      .iso.datetime({ message: 'Invalid date. Use ISO 8601' })
      .transform((val) => new Date(val))
      .optional(),

    // Sorting
    sortBy: z
      .enum(['date', 'amount', 'category', 'createdAt'])
      .default('date'),
    sortOrder: z
      .enum(['asc', 'desc'])
      .default('desc'),

    // Search
    search: z.string().max(100).optional(),
  })
  // from must be before to
  .refine(
    (data) => {
      if (data.from && data.to) {
        return data.from <= data.to
      }
      return true
    },
    {
      message: 'from date must be before to date',
      path: ['from'],
    }
  ),
})