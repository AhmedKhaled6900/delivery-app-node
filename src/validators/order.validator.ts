import { body, param } from 'express-validator';

const addressRules = [
  body('pickupAddress.street').trim().notEmpty().withMessage('Pickup street is required'),
  body('pickupAddress.city').trim().notEmpty().withMessage('Pickup city is required'),
  body('dropoffAddress.street').trim().notEmpty().withMessage('Dropoff street is required'),
  body('dropoffAddress.city').trim().notEmpty().withMessage('Dropoff city is required'),
];

export const createOrderRules = [
  ...addressRules,
  body('totalAmount').optional().isFloat({ min: 0 }).withMessage('totalAmount must be a positive number'),
  body('notes').optional().trim(),
  body('pickupAddress.coordinates.lat').optional().isFloat(),
  body('pickupAddress.coordinates.lng').optional().isFloat(),
  body('dropoffAddress.coordinates.lat').optional().isFloat(),
  body('dropoffAddress.coordinates.lng').optional().isFloat(),
];

export const orderIdParam = [param('id').isMongoId().withMessage('Invalid order id')];

export const updateStatusRules = [
  ...orderIdParam,
  body('status')
    .isIn(['picked_up', 'delivered'])
    .withMessage('status must be picked_up or delivered'),
];

export const assignOrderRules = [
  ...orderIdParam,
  body('deliveryId').isMongoId().withMessage('Valid deliveryId is required'),
];
