import { Router } from 'express';
import { deliveryAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { orderIdParam, updateStatusRules } from '../../validators/order.validator';
import * as orderController from '../../controllers/delivery/order.controller';

const router = Router();

router.use(deliveryAuth);

router.get('/available', orderController.listAvailable);
router.get('/my', orderController.listMine);
router.post('/:id/accept', orderIdParam, validate, orderController.accept);
router.patch('/:id/status', updateStatusRules, validate, orderController.updateStatus);
router.get('/:id', orderIdParam, validate, orderController.getOne);

export default router;
