import { FinancialRecord } from "../models/record.model.js";
import ApiError from '../utils/ApiError.js'

// create record
export const createRecord = async (data, userId) => {
  const record = await FinancialRecord.create({
    amount: Math.round(data.amount * 100),
    type: data.type,
    category: data.category,
    date: data.date,
    description: data.description,
    createdBy: userId,
  })

  return record
}

// get all record
export const getAllRecords = async ({
  page,
  limit,
  type,
  category,
  from,
  to,
  sortBy,
  sortOrder,
  search,
}) => {
  // Build filter query dynamically
  const query = {}

  if (type)     query.type = type
  if (category) query.category = category

  // Date range filter
  if (from || to) {
    query.date = {}
    if (from) query.date.$gte = from
    if (to)   query.date.$lte = to
  }

  // Search in description — case insensitive
  if (search) {
    query.description = { $regex: search, $options: 'i' }
  }

  // Build sort object
  const sort = {
    [sortBy]: sortOrder === 'asc' ? 1 : -1
  }

  const skip = (page - 1) * limit

  // Run query and count in parallel for performance
  const [records, total] = await Promise.all([
    FinancialRecord.find(query)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    FinancialRecord.countDocuments(query)
  ])

  return {
    records,
    meta: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      filters: {
        type:     type     || null,
        category: category || null,
        from:     from     || null,
        to:       to       || null,
        search:   search   || null,
      }
    }
  }
}

// get record by id
export const getRecordById = async (id) => {
  const record = await FinancialRecord.findById(id)
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email')

  if (!record) throw new ApiError(404, 'Record not found')

  return record
}

// update record
export const updateRecord = async (id, data, userId) => {
  const record = await FinancialRecord.findById(id)
  if (!record) throw new ApiError(404, 'Record not found')

  // Only update fields that were actually provided
  if (data.amount !== undefined) record.amount = Math.round(data.amount * 100)
  if (data.type        !== undefined) record.type        = data.type
  if (data.category    !== undefined) record.category    = data.category
  if (data.date        !== undefined) record.date        = data.date
  if (data.description !== undefined) record.description = data.description

  // Track who made the last update
  record.updatedBy = userId

  await record.save()

  return record
}

// soft delete record
export const deleteRecord = async (id) => {
  const record = await FinancialRecord.findById(id)
  if (!record) throw new ApiError(404, 'Record not found')

  record.isDeleted = true
  await record.save()
}