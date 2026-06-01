import { Router } from 'express';
import mongoose from 'mongoose';
import clientRoutes from './client';
import deliveryRoutes from './delivery';
import adminRoutes from './admin';

const router = Router();

router.get('/health', (_req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  if (!dbReady) {
    res.status(503).json({
      success: false,
      message: 'Database is connecting…',
      dbState: mongoose.connection.readyState,
    });
    return;
  }
  res.json({ success: true, message: 'Delivery API is running' });
});

router.use('/client', clientRoutes);
router.use('/delivery', deliveryRoutes);
router.use('/admin', adminRoutes);

export default router;
