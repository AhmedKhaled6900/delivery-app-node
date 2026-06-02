import { Router } from 'express';
import { adminAuth } from '../../middleware/auth';
import { loadAdminPermissions, requirePermission } from '../../middleware/permissions';
import { validate } from '../../middleware/validate';
import {
  createStaffRules,
  updateStaffRules,
  staffIdParam,
} from '../../validators/rbac.validator';
import * as staffController from '../../controllers/admin/staff.controller';

const router = Router();

router.use(adminAuth, loadAdminPermissions);

router.get('/', requirePermission('staff.view', 'staff.manage'), staffController.listStaff);
router.get('/:id', requirePermission('staff.view', 'staff.manage'), staffIdParam, validate, staffController.getStaff);
router.post('/', requirePermission('staff.manage'), createStaffRules, validate, staffController.createStaff);
router.patch('/:id', requirePermission('staff.manage'), updateStaffRules, validate, staffController.updateStaff);
router.delete('/:id', requirePermission('staff.manage'), staffIdParam, validate, staffController.deleteStaff);

export default router;
