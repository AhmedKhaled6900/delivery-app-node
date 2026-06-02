import { Router } from 'express';
import { adminAuth } from '../../middleware/auth';
import { loadAdminPermissions, requirePermission } from '../../middleware/permissions';
import * as dashboardController from '../../controllers/admin/dashboard.controller';

const router = Router();

router.use(adminAuth, loadAdminPermissions);

router.get('/stats', requirePermission('dashboard.view_stats'), dashboardController.getStats);
router.get('/clients', requirePermission('clients.view'), dashboardController.listClients);
router.get('/deliveries', requirePermission('deliveries.view'), dashboardController.listDeliveries);
router.get('/orders', requirePermission('orders.view'), dashboardController.listOrders);
router.patch(
  '/deliveries/:id/toggle-status',
  requirePermission('deliveries.manage'),
  dashboardController.toggleDeliveryStatus
);

export default router;
