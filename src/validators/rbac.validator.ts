import { body, param } from 'express-validator';
import { isValidPermission } from '../config/permissions';
import { nameRule } from './auth.validator';

const passwordRule = body('password')
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters');

const countryCodeRule = body('countryCode')
  .optional()
  .isLength({ min: 2, max: 2 })
  .withMessage('countryCode must be ISO 2-letter code (e.g. EG, SA, AE)');

const phoneRule = body('phone').trim().notEmpty().withMessage('Phone is required');

const emailRule = body('email')
  .optional()
  .isEmail()
  .normalizeEmail()
  .withMessage('Valid email is required');

const roleIdsRule = body('roleIds')
  .isArray({ min: 1 })
  .withMessage('At least one role is required')
  .bail()
  .custom((ids: unknown[]) => {
    if (!ids.every((id) => typeof id === 'string' && id.length > 0)) {
      throw new Error('roleIds must be an array of valid role IDs');
    }
    return true;
  });

export const createStaffRules = [
  nameRule,
  phoneRule,
  emailRule,
  passwordRule,
  countryCodeRule,
  roleIdsRule,
];

export const updateStaffRules = [
  param('id').isMongoId().withMessage('Invalid staff id'),
  nameRule.optional(),
  phoneRule.optional(),
  emailRule,
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  countryCodeRule,
  body('roleIds')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one role is required when updating roles'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
];

export const staffIdParam = [param('id').isMongoId().withMessage('Invalid staff id')];

export const createRoleRules = [
  body('name').trim().notEmpty().withMessage('Role name is required'),
  body('description').optional().trim(),
  body('permissions')
    .isArray({ min: 1 })
    .withMessage('At least one permission is required')
    .bail()
    .custom((perms: unknown[]) => {
      if (!perms.every((p) => typeof p === 'string' && isValidPermission(p))) {
        throw new Error('permissions contains invalid values');
      }
      return true;
    }),
];

export const updateRoleRules = [
  param('id').isMongoId().withMessage('Invalid role id'),
  body('name').optional().trim().notEmpty().withMessage('Role name cannot be empty'),
  body('description').optional().trim(),
  body('permissions')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one permission is required')
    .bail()
    .custom((perms: unknown[]) => {
      if (!perms.every((p) => typeof p === 'string' && isValidPermission(p))) {
        throw new Error('permissions contains invalid values');
      }
      return true;
    }),
];

export const roleIdParam = [param('id').isMongoId().withMessage('Invalid role id')];
