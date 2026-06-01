import { Router } from 'express';
import { adminAuth } from '../../middleware/auth';
import * as dashboardController from '../../controllers/admin/dashboard.controller';

const router = Router();

router.use(adminAuth);

router.get('/stats', dashboardController.getStats);
router.get('/clients', dashboardController.listClients);
router.get('/deliveries', dashboardController.listDeliveries);
router.get('/orders', dashboardController.listOrders);
router.patch('/deliveries/:id/toggle-status', dashboardController.toggleDeliveryStatus);

export default router;
