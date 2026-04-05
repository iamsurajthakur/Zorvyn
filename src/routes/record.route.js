import { Router } from "express";
import * as recordController from '../controllers/record.controller.js'
import { authenticate } from '../middlewares/authenticate.middleware.js'
import { authorize } from '../middlewares/authorize.middleware.js'
import validate from '../middlewares/validate.middleware.js'
import { PERMISSIONS } from '../constants/permissions.js'
import {
  createRecordSchema,
  updateRecordSchema,
  recordIdParamSchema,
  getRecordsQuerySchema,
} from '../schemas/record.schema.js'

const router = Router()

// all record require authentication
router.use(authenticate)

// ----------read routes-----------
router.get(
  '/getAllRecords',
  authorize(PERMISSIONS.RECORDS_READ),
  validate(getRecordsQuerySchema),
  recordController.getAllRecords
)

router.get(
  '/:id/getRecordById',
  authorize(PERMISSIONS.RECORDS_READ),
  validate(recordIdParamSchema),
  recordController.getRecordById
)

// -----------write routes------------
router.post(
  '/createRecord',
  authorize(PERMISSIONS.RECORDS_CREATE),
  validate(createRecordSchema),
  recordController.createRecord
)

router.patch(
  '/:id/updateRecord',
  authorize(PERMISSIONS.RECORDS_UPDATE),
  validate(updateRecordSchema),
  recordController.updateRecord
)

router.delete(
  '/:id/deleteRecord',
  authorize(PERMISSIONS.RECORDS_DELETE),
  validate(recordIdParamSchema),
  recordController.deleteRecord
)

export default router