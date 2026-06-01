import { Router } from 'express';
import { deliveryRegisterRules, deliveryLoginRules } from '../../validators/auth.validator';
import { validate } from '../../middleware/validate';
import { deliveryAuth } from '../../middleware/auth';
import * as authController from '../../controllers/delivery/auth.controller';

const router = Router();

router.post('/register', deliveryRegisterRules, validate, authController.register);
router.post('/login', deliveryLoginRules, validate, authController.login);
router.get('/me', deliveryAuth, authController.getProfile);
router.patch('/availability', deliveryAuth, authController.toggleAvailability);

export default router;
