import { Router } from 'express';
import clientRoutes from './client';
import deliveryRoutes from './delivery';
import adminRoutes from './admin';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true });
});

router.use('/client', clientRoutes);
router.use('/delivery', deliveryRoutes);
router.use('/admin', adminRoutes);

export default router;
