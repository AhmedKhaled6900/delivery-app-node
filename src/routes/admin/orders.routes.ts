import { Router } from 'express';
import { adminAuth } from '../../middleware/auth';
import { loadAdminPermissions, requirePermission } from '../../middleware/permissions';
import { validate } from '../../middleware/validate';
import { orderIdParam, assignOrderRules } from '../../validators/order.validator';
import * as orderController from '../../controllers/admin/order.controller';

const router = Router();

router.use(adminAuth, loadAdminPermissions);

router.get('/:id', requirePermission('orders.view'), orderIdParam, validate, orderController.getOne);
router.patch(
  '/:id/assign',
  requirePermission('orders.assign'),
  assignOrderRules,
  validate,
  orderController.assign
);
router.patch(
  '/:id/cancel',
  requirePermission('orders.cancel'),
  orderIdParam,
  validate,
  orderController.cancel
);

export default router;
