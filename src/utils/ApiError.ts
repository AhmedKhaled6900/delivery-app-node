import type { ValidationError } from 'express-validator';

export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
  errors?: ValidationError[];

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}
