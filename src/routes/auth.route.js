import { Router } from "express";
import * as authController from '../controllers/auth.controller.js'
import { authenticate } from "../middlewares/authenticate.middleware.js";
import validate from '../middlewares/validate.middleware.js'
import { registerSchema, loginSchema } from '../schemas/auth.schema.js'

const router = Router()

router.post('/register', validate(registerSchema),  authController.register)
router.post('/login',    validate(loginSchema),     authController.login)
router.get('/me',        authenticate,              authController.getMe)
router.post('/logout',   authenticate,              authController.logout)

export default router