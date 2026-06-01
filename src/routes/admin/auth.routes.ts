import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { adminAuth } from '../../middleware/auth';
import {
  adminLoginPhoneRules,
  adminLoginEmailRules,
  adminForgotPasswordRules,
  adminResetPasswordRules,
} from '../../validators/auth.validator';
import * as authController from '../../controllers/admin/auth.controller';

const router = Router();

router.post('/login/phone', adminLoginPhoneRules, validate, authController.loginPhone);
router.post('/login/email', adminLoginEmailRules, validate, authController.loginEmail);
router.post('/forgot-password', adminForgotPasswordRules, validate, authController.forgotPassword);
router.post('/reset-password', adminResetPasswordRules, validate, authController.resetPassword);
router.get('/me', adminAuth, authController.getProfile);

export default router;
