import * as userService from '../services/user.service.js'
import ApiResponse from '../utils/ApiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'

export const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(
    req.validatedData.body,
    req.user._id
  )
  return res
    .status(201)
    .json(new ApiResponse(201, user, 'User created successfully'))
})

export const getAllUsers = asyncHandler(async (req, res) => {
  const { page, limit, role, isActive } = req.validatedData.query
  const { users, meta } = await userService.getAllUsers({ page, limit, role, isActive })
  return res
    .status(200)
    .json(new ApiResponse(200, users, 'Users fetched successfully', meta))
})

export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.validatedData.params
  const user = await userService.getUserById(id)
  return res
    .status(200)
    .json(new ApiResponse(200, user, 'User fetched successfully'))
})

export const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.validatedData.params
  const { role } = req.validatedData.body
  const user = await userService.updateUserRole(id, role, req.user._id)
  return res
    .status(200)
    .json(new ApiResponse(200, user, 'User role updated successfully'))
})

export const updateUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.validatedData.params
  const { isActive } = req.validatedData.body
  const user = await userService.updateUserStatus(id, isActive, req.user._id)
  return res
    .status(200)
    .json(new ApiResponse(200, user, `User ${isActive ? 'activated' : 'deactivated'} successfully`))
})

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.validatedData.params
  await userService.deleteUser(id, req.user._id)
  return res
    .status(200)
    .json(new ApiResponse(200, null, 'User deleted successfully'))
})