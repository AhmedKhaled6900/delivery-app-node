import { Router } from 'express';
import { loginRules } from '../../validators/auth.validator';
import { validate } from '../../middleware/validate';
import { adminAuth } from '../../middleware/auth';
import * as authController from '../../controllers/admin/auth.controller';

const router = Router();

router.post('/login', loginRules, validate, authController.login);
router.get('/me', adminAuth, authController.getProfile);

export default router;
