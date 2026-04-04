import ApiError from '../utils/ApiError.js'
import { hasPermission } from '../config/rbac.js'
// Single permission check
// Usage: authorize('records:read')
export const authorize = (permission) => (req, _res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Authentication required'))
  }

  if (!hasPermission(req.user.role, permission)) {
    return next(
      new ApiError(403, `Access denied: requires '${permission}' permission`)
    )
  }

  next()
}

// Multiple permissions — user must have ALL of them
// Usage: authorizeAll('records:read', 'dashboard:read')
export const authorizeAll = (...permissions) => (req, _res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Authentication required'))
  }

  const missing = permissions.filter(
    (p) => !hasPermission(req.user.role, p)
  )

  if (missing.length > 0) {
    return next(
      new ApiError(403, `Access denied: missing permissions: ${missing.join(', ')}`)
    )
  }

  next()
}

// Multiple permissions — user must have AT LEAST ONE
// Usage: authorizeAny('records:create', 'records:update')
export const authorizeAny = (...permissions) => (req, _res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Authentication required'))
  }

  const hasAny = permissions.some(
    (p) => hasPermission(req.user.role, p)
  )

  if (!hasAny) {
    return next(
      new ApiError(403, `Access denied: requires one of: ${permissions.join(', ')}`)
    )
  }

  next()
}