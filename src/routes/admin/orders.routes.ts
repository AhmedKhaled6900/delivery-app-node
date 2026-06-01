import { Router } from 'express';
import { adminAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { orderIdParam, assignOrderRules } from '../../validators/order.validator';
import * as orderController from '../../controllers/admin/order.controller';

const router = Router();

router.use(adminAuth);

router.get('/:id', orderIdParam, validate, orderController.getOne);
router.patch('/:id/assign', assignOrderRules, validate, orderController.assign);
router.patch('/:id/cancel', orderIdParam, validate, orderController.cancel);

export default router;
