import { body } from 'express-validator';

const passwordRule = body('password')
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters');

const countryCodeRule = body('countryCode')
  .optional()
  .isLength({ min: 2, max: 2 })
  .withMessage('countryCode must be ISO 2-letter code (e.g. EG, SA, AE)');

const phoneRule = body('phone').trim().notEmpty().withMessage('Phone is required');

const emailRule = body('email').isEmail().normalizeEmail().withMessage('Valid email is required');

const otpCodeRule = body('code')
  .trim()
  .isLength({ min: 6, max: 6 })
  .isNumeric()
  .withMessage('OTP must be 6 digits');

const channelRule = body('channel')
  .isIn(['phone', 'email'])
  .withMessage('channel must be phone or email');

export const nameRule = body('name').trim().notEmpty().withMessage('Name is required');

export const adminLoginPhoneRules = [phoneRule, countryCodeRule, passwordRule];

export const adminLoginEmailRules = [emailRule, passwordRule];

function requireIdentifierForChannel() {
  return body().custom((_value, { req }) => {
    if (req.body.channel === 'phone' && !req.body.phone) {
      throw new Error('phone is required when channel is phone');
    }
    if (req.body.channel === 'email' && !req.body.email) {
      throw new Error('email is required when channel is email');
    }
    return true;
  });
}

export const adminForgotPasswordRules = [
  channelRule,
  requireIdentifierForChannel(),
  body('phone').optional().trim().notEmpty(),
  body('email').optional().isEmail().normalizeEmail(),
  countryCodeRule,
];

export const adminResetPasswordRules = [
  channelRule,
  requireIdentifierForChannel(),
  body('phone').optional().trim().notEmpty(),
  body('email').optional().isEmail().normalizeEmail(),
  otpCodeRule,
  passwordRule,
  countryCodeRule,
];

export const clientRegisterEmailRules = [nameRule, emailRule, passwordRule, countryCodeRule];

export const clientRegisterPhoneRules = [nameRule, phoneRule, passwordRule, countryCodeRule];

export const clientGoogleRules = [
  body('idToken').trim().notEmpty().withMessage('Google idToken is required'),
  nameRule.optional(),
  countryCodeRule,
];

export const clientLoginEmailRules = [emailRule, passwordRule];

export const clientLoginPhoneRules = [phoneRule, passwordRule, countryCodeRule];

export const clientGoogleLoginRules = [
  body('idToken').trim().notEmpty().withMessage('Google idToken is required'),
];

export const clientVerifyOtpRules = [channelRule, otpCodeRule];

export const clientResendOtpRules = [channelRule];

export const deliveryRegisterRules = [nameRule, emailRule, phoneRule, passwordRule, countryCodeRule];

export const deliveryLoginRules = [emailRule, passwordRule];
