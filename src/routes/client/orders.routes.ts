import { Router } from 'express';
import { clientAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createOrderRules, orderIdParam } from '../../validators/order.validator';
import * as orderController from '../../controllers/client/order.controller';

const router = Router();

router.use(clientAuth);

router.post('/', createOrderRules, validate, orderController.create);
router.get('/', orderController.listMine);
router.get('/:id', orderIdParam, validate, orderController.getOne);
router.patch('/:id/cancel', orderIdParam, validate, orderController.cancel);

export default router;
