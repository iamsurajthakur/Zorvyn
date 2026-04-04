import * as authService from '../services/auth.service.js'
import ApiResponse from '../utils/ApiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'

export const register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.registerUser(req.validatedData.body)
  return res
    .status(201)
    .json(new ApiResponse(201, { user, accessToken, refreshToken }, 'Registration successful'))
})

export const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.loginUser(req.validatedData.body)
  return res
    .status(200)
    .json(new ApiResponse(200, { user, accessToken, refreshToken }, 'Login successful'))
})

export const getMe = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, 'Profile fetched'))
})

export const logout = asyncHandler(async (req, res) => {
  await authService.logoutUser(req.user._id)
  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Logged out successfully'))
})