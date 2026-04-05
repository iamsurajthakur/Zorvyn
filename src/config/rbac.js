import { PERMISSIONS } from "../constants/permissions.js";

const {
  RECORDS_READ, RECORDS_CREATE, RECORDS_UPDATE, RECORDS_DELETE,
  DASHBOARD_READ,
  USERS_READ, USERS_CREATE, USERS_UPDATE, USERS_DELETE
} = PERMISSIONS

export const ROLE_PERMISSIONS = {
    VIEWER: [
    DASHBOARD_READ,                  
  ],

  ANALYST: [
    RECORDS_READ,
    DASHBOARD_READ,      
  ],

  ADMIN: [
    RECORDS_READ,
    RECORDS_CREATE,
    RECORDS_UPDATE,
    RECORDS_DELETE,
    DASHBOARD_READ,
    USERS_READ,
    USERS_CREATE,
    USERS_UPDATE,
    USERS_DELETE,
  ],
}

// Helper — get permissions for a role
export const getPermissions = (role) => {
  return ROLE_PERMISSIONS[role] ?? []
}

// Helper — check if a role has a specific permission
export const hasPermission = (role, permission) => {
  return getPermissions(role).includes(permission)
}