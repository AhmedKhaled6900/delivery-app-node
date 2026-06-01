import { Router } from 'express';
import { registerRules, loginRules } from '../../validators/auth.validator';
import { validate } from '../../middleware/validate';
import { clientAuth } from '../../middleware/auth';
import * as authController from '../../controllers/client/auth.controller';

const router = Router();

router.post('/register', registerRules, validate, authController.register);
router.post('/login', loginRules, validate, authController.login);
router.get('/me', clientAuth, authController.getProfile);

export default router;
