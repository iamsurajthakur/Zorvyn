import * as recordService from '../services/record.service.js'
import ApiResponse from '../utils/ApiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'

// create record
export const createRecord = asyncHandler(async (req, res) => {
  const record = await recordService.createRecord(
    req.validatedData.body,
    req.user._id
  )
  return res
    .status(201)
    .json(new ApiResponse(201, record, 'Record created successfully'))
})

// get all records
export const getAllRecords = asyncHandler(async (req, res) => {
  const {
    page,
    limit,
    type,
    category,
    from,
    to,
    sortBy,
    sortOrder,
    search,
  } = req.validatedData.query

  const { records, meta } = await recordService.getAllRecords({
    page,
    limit,
    type,
    category,
    from,
    to,
    sortBy,
    sortOrder,
    search,
  })

  return res
    .status(200)
    .json(new ApiResponse(200, records, 'Records fetched successfully', meta))
})

// get record by id
export const getRecordById = asyncHandler(async (req, res) => {
  const { id } = req.validatedData.params
  const record = await recordService.getRecordById(id)
  return res
    .status(200)
    .json(new ApiResponse(200, record, 'Record fetched successfully'))
})

// update record
export const updateRecord = asyncHandler(async (req, res) => {
  const { id } = req.validatedData.params
  const record = await recordService.updateRecord(
    id,
    req.validatedData.body,
    req.user._id   // ✅ pass userId for updatedBy tracking
  )
  return res
    .status(200)
    .json(new ApiResponse(200, record, 'Record updated successfully'))
})

// soft delete record
export const deleteRecord = asyncHandler(async (req, res) => {
  const { id } = req.validatedData.params
  await recordService.deleteRecord(id)
  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Record deleted successfully'))
})