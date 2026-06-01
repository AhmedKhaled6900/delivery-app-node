import { Router } from 'express';
import clientRoutes from './client';
import deliveryRoutes from './delivery';
import adminRoutes from './admin';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Delivery API is running' });
});

router.use('/client', clientRoutes);
router.use('/delivery', deliveryRoutes);
router.use('/admin', adminRoutes);

export default router;
