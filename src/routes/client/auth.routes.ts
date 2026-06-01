import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { clientAuth } from '../../middleware/auth';
import {
  clientRegisterEmailRules,
  clientRegisterPhoneRules,
  clientGoogleRules,
  clientLoginEmailRules,
  clientLoginPhoneRules,
  clientGoogleLoginRules,
  clientVerifyOtpRules,
  clientResendOtpRules,
} from '../../validators/auth.validator';
import * as authController from '../../controllers/client/auth.controller';

const router = Router();

router.post('/register/email', clientRegisterEmailRules, validate, authController.registerEmail);
router.post('/register/phone', clientRegisterPhoneRules, validate, authController.registerPhone);
router.post('/register/google', clientGoogleRules, validate, authController.registerGoogle);

router.post('/login/email', clientLoginEmailRules, validate, authController.loginEmail);
router.post('/login/phone', clientLoginPhoneRules, validate, authController.loginPhone);
router.post('/login/google', clientGoogleLoginRules, validate, authController.loginGoogle);

router.post('/verify-otp', clientAuth, clientVerifyOtpRules, validate, authController.verifyOtpCode);
router.post('/resend-otp', clientAuth, clientResendOtpRules, validate, authController.resendOtp);

router.get('/me', clientAuth, authController.getProfile);

export default router;
