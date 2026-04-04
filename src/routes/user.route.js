import { Router } from "express";
import * as userController from '../controllers/user.controller.js'
import { authenticate } from "../middlewares/authenticate.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { PERMISSIONS } from "../constants/permissions.js";
import { 
    createUserSchema,
    updateRoleSchema,
    updateStatusSchema,
    userIdParamSchema,
    getUsersQuerySchema
} from "../schemas/user.schema.js";

const router = Router()

// All user management routes require authentication + USERS permissions
router.use(authenticate)
router.use(authorize(PERMISSIONS.USERS_READ))

router.get(
    '/getAllUsers',
    validate(getUsersQuerySchema),
    userController.getAllUsers
)

router.get(
    '/getUserById/:id',
    validate(userIdParamSchema),
    userController.getUserById
)

router.post(
    '/createUser',
    authorize(PERMISSIONS.USERS_CREATE),
    validate(createUserSchema),
    userController.createUser
)

router.patch(
  '/updateUserRole/:id/role',
  authorize(PERMISSIONS.USERS_UPDATE),
  validate(updateRoleSchema),
  userController.updateUserRole
)

router.patch(
  '/updateUserStatus/:id/status',
  authorize(PERMISSIONS.USERS_UPDATE),
  validate(updateStatusSchema),
  userController.updateUserStatus
)

router.delete(
  '/deleteUser/:id',
  authorize(PERMISSIONS.USERS_DELETE),
  validate(userIdParamSchema),
  userController.deleteUser
)

export default router