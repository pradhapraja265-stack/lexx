import { Request, Response, NextFunction } from 'express';
import { AppError, ApiErrorResponse, ValidationErrorDetail } from '../types';

// Central error handling middleware
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let appError: AppError;

  if (error instanceof AppError) {
    appError = error;
  } else if (error.name === 'ValidationError') {
    // Mongoose validation error
    appError = handleValidationError(error);
  } else if (error.name === 'CastError') {
    // Mongoose cast error (invalid ObjectId)
    appError = new AppError('Invalid resource ID', 400, 'INVALID_ID');
  } else if (error.name === 'MongoError' || (error as any).code === 11000) {
    // MongoDB duplicate key error
    appError = handleDuplicateKeyError(error);
  } else if (error.name === 'JsonWebTokenError') {
    appError = new AppError('Invalid token', 401, 'INVALID_TOKEN');
  } else if (error.name === 'TokenExpiredError') {
    appError = new AppError('Token expired', 401, 'TOKEN_EXPIRED');
  } else if (error.name === 'MulterError') {
    appError = handleMulterError(error);
  } else {
    // Unknown error
    appError = new AppError(
      process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
      500,
      'INTERNAL_ERROR'
    );
  }

  const response: ApiErrorResponse = {
    success: false,
    error: appError.message,
    code: appError.code,
  };

  // Add validation details if available
  if ('details' in appError && appError.details) {
    response.details = appError.details as ValidationErrorDetail[];
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = appError.stack;
  }

  // Log error details
  console.error('Error:', {
    message: appError.message,
    code: appError.code,
    statusCode: appError.statusCode,
    stack: appError.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
  });

  res.status(appError.statusCode).json(response);
};

// Handle Mongoose validation errors
const handleValidationError = (error: any): AppError => {
  const details: ValidationErrorDetail[] = Object.keys(error.errors).map((key) => ({
    field: key,
    message: error.errors[key].message,
    value: error.errors[key].value,
  }));

  const appError = new AppError('Validation failed', 400, 'VALIDATION_ERROR');
  (appError as any).details = details;
  return appError;
};

// Handle MongoDB duplicate key errors
const handleDuplicateKeyError = (error: any): AppError => {
  const field = Object.keys(error.keyValue)[0];
  const value = error.keyValue[field];

  let message = 'Duplicate field value';
  if (field === 'email') {
    message = 'Email already exists';
  } else if (field === 'firebaseUid') {
    message = 'User account already exists';
  }

  return new AppError(message, 400, 'DUPLICATE_FIELD');
};

// Handle Multer (file upload) errors
const handleMulterError = (error: any): AppError => {
  switch (error.code) {
    case 'LIMIT_FILE_SIZE':
      return new AppError('File too large', 400, 'FILE_TOO_LARGE');
    case 'LIMIT_FILE_COUNT':
      return new AppError('Too many files', 400, 'TOO_MANY_FILES');
    case 'LIMIT_UNEXPECTED_FILE':
      return new AppError('Unexpected file field', 400, 'UNEXPECTED_FILE');
    default:
      return new AppError('File upload error', 400, 'UPLOAD_ERROR');
  }
};

// Handle 404 errors
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404, 'NOT_FOUND');
  next(error);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Rate limit error handler
export const rateLimitHandler = (req: Request, res: Response): void => {
  const response: ApiErrorResponse = {
    success: false,
    error: 'Too many requests. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  };

  res.status(429).json(response);
};