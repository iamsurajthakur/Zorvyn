import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";

export const createUser = async (data, adminId) => {
    const existing = await User.findOne({ email: data.email })
    if(existing) throw new ApiError(409,'Email already registered')

    const user = await User.create({
        name: data.name,
        email: data.email,
        passwordHash: data.password,
        role: data.role,
        isActive: data.isActive,
        createdBy: adminId
    })

    const userObject = user.toObject()
    delete userObject.passwordHash
    delete userObject.refreshToken
    delete userObject.__v

    return userObject
}

export const getAllUsers = async ({ page, limit, role, isActive }) => {
    const query = {}
    if(role) query.role = role
    if(isActive !== undefined) query.isActive = isActive

    const skip = (page - 1) * limit

    const [users, total] = await Promise.all([
    User.find(query)
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(query)
  ])

  return {
    users,
    meta: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    }
  }
}

export const getUserById = async (id) => {
    const user = await User.findById(id).select('-__v')
    if(!user) throw new ApiError(404,'User not found.')
    return user
}

export const updateUserRole = async (targetId, newRole, adminId) => {
  if (targetId === adminId.toString()) {
    throw new ApiError(403, 'You cannot change your own role')
  }

  const user = await User.findById(targetId)
  if (!user) throw new ApiError(404, 'User not found')

  user.role = newRole
  await user.save({ validateBeforeSave: false })

  const userObject = user.toObject()
  delete userObject.passwordHash
  delete userObject.refreshToken
  delete userObject.__v

  return userObject
}

export const updateUserStatus = async (targetId, isActive, adminId) => {
  if (targetId === adminId.toString()) {
    throw new ApiError(403, 'You cannot change your own status')
  }

  const user = await User.findById(targetId)
  if (!user) throw new ApiError(404, 'User not found')

  user.isActive = isActive
  await user.save({ validateBeforeSave: false })

  const userObject = user.toObject()
  delete userObject.passwordHash
  delete userObject.refreshToken
  delete userObject.__v

  return userObject
}

export const deleteUser = async (targetId, adminId) => {
  if (targetId === adminId.toString()) {
    throw new ApiError(403, 'You cannot delete your own account')
  }

  const user = await User.findById(targetId)
  if (!user) throw new ApiError(404, 'User not found')

  user.isDeleted = true
  user.isActive = false
  await user.save({ validateBeforeSave: false })
}
