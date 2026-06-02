import { Router } from 'express';
import { adminAuth } from '../../middleware/auth';
import { loadAdminPermissions, requirePermission } from '../../middleware/permissions';
import * as permissionController from '../../controllers/admin/permission.controller';

const router = Router();

router.use(adminAuth, loadAdminPermissions);
router.get('/', requirePermission('roles.view', 'roles.manage'), permissionController.listPermissions);

export default router;
