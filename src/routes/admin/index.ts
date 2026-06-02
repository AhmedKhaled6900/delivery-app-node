import { Router } from 'express';
import authRoutes from './auth.routes';
import dashboardRoutes from './dashboard.routes';
import ordersRoutes from './orders.routes';
import rolesRoutes from './roles.routes';
import staffRoutes from './staff.routes';
import permissionsRoutes from './permissions.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/orders', ordersRoutes);
router.use('/roles', rolesRoutes);
router.use('/staff', staffRoutes);
router.use('/permissions', permissionsRoutes);

export default router;
