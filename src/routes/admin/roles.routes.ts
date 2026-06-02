import { Router } from 'express';
import { adminAuth } from '../../middleware/auth';
import { loadAdminPermissions, requirePermission } from '../../middleware/permissions';
import { validate } from '../../middleware/validate';
import {
  createRoleRules,
  updateRoleRules,
  roleIdParam,
} from '../../validators/rbac.validator';
import * as roleController from '../../controllers/admin/role.controller';

const router = Router();

router.use(adminAuth, loadAdminPermissions);

router.get('/', requirePermission('roles.view', 'roles.manage'), roleController.listRoles);
router.get('/:id', requirePermission('roles.view', 'roles.manage'), roleIdParam, validate, roleController.getRole);
router.post('/', requirePermission('roles.manage'), createRoleRules, validate, roleController.createRole);
router.patch('/:id', requirePermission('roles.manage'), updateRoleRules, validate, roleController.updateRole);
router.delete('/:id', requirePermission('roles.manage'), roleIdParam, validate, roleController.deleteRole);

export default router;
