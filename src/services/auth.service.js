import { User } from '../models/user.model.js'
import ApiError from '../utils/ApiError.js'

export const registerUser = async (data) => {
  const existing = await User.findOne({ email: data.email })
  if (existing) throw new ApiError(409, 'Email already registered')

  const user = await User.create({
    name: data.name,
    email: data.email,
    passwordHash: data.password,
    role: 'VIEWER', // always VIEWER on register
  })

  const accessToken = user.generateAccessToken() 
  const refreshToken = user.generateRefreshToken()

  user.refreshToken = refreshToken
  await user.save({ validateBeforeSave: false })

  const userObject = user.toObject()
  delete userObject.refreshToken
  delete userObject.passwordHash
  delete userObject.__v

  return { user: userObject, accessToken, refreshToken }
}

export const loginUser = async ({ email, password }) => {

  const user = await User.findOne({ email }).select('+passwordHash')

  if (!user || !(await user.isPasswordCorrect(password))) {
    throw new ApiError(401, 'Invalid email or password')
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Account is deactivated. Contact admin.')
  }

  const accessToken = user.generateAccessToken()
  const refreshToken = user.generateRefreshToken()

  user.refreshToken = refreshToken
  user.lastLogin = new Date()
  await user.save({ validateBeforeSave: false })

  const userObject = user.toObject()
  delete userObject.refreshToken
  delete userObject.passwordHash
  delete userObject.__v

  return { user: userObject, accessToken, refreshToken }
}

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId)
  if (!user) throw new ApiError(404, 'User not found')
  return user
}

export const logoutUser = async (userId) => {
  await User.findByIdAndUpdate(userId, {
    $unset: { refreshToken: 1 }
  })
}