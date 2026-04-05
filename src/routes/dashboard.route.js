import { Router } from "express";
import * as dashboardController from '../controllers/dashboard.controller.js'
import { authenticate } from '../middlewares/authenticate.middleware.js'
import { authorize } from '../middlewares/authorize.middleware.js'
import validate from '../middlewares/validate.middleware.js'
import { PERMISSIONS } from '../constants/permissions.js'
import {
  summaryQuerySchema,
  categoryQuerySchema,
  trendsQuerySchema,
  recentActivityQuerySchema,
} from '../schemas/dashboard.schema.js'

const router = Router()

//All dashboard routes require authentication
router.use(authenticate)

router.use(authorize(PERMISSIONS.DASHBOARD_READ))

router.get(
    '/summary',
    validate(summaryQuerySchema),
    dashboardController.getSummary
)

router.get(
  '/categories',
  validate(categoryQuerySchema),
  dashboardController.getCategoryBreakdown
)

router.get(
  '/trends',
  validate(trendsQuerySchema),
  dashboardController.getMonthlyTrends
)

router.get(
  '/recent',
  validate(recentActivityQuerySchema),
  dashboardController.getRecentActivity
)

export default router