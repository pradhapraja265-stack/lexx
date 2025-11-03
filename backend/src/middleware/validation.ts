import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError, ValidationErrorDetail } from '../types';

// Generic validation middleware
export const validate = (schema: Joi.ObjectSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const data = req[source];
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      const details: ValidationErrorDetail[] = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value,
      }));

      const appError = new AppError('Validation failed', 400, 'VALIDATION_ERROR');
      (appError as any).details = details;
      return next(appError);
    }

    // Replace the request data with validated and sanitized data
    req[source] = value;
    next();
  };
};

// Validation schemas
export const schemas = {
  // Authentication schemas
  login: Joi.object({
    firebaseToken: Joi.string().required().messages({
      'string.empty': 'Firebase token is required',
      'any.required': 'Firebase token is required',
    }),
  }),

  register: Joi.object({
    firebaseToken: Joi.string().required().messages({
      'string.empty': 'Firebase token is required',
      'any.required': 'Firebase token is required',
    }),
    displayName: Joi.string().min(2).max(50).trim().required().messages({
      'string.min': 'Display name must be at least 2 characters',
      'string.max': 'Display name cannot exceed 50 characters',
      'string.empty': 'Display name is required',
      'any.required': 'Display name is required',
    }),
  }),

  // Chat session schemas
  createChatSession: Joi.object({
    title: Joi.string().min(1).max(200).trim().optional().messages({
      'string.min': 'Title cannot be empty',
      'string.max': 'Title cannot exceed 200 characters',
    }),
  }),

  chatSessionId: Joi.object({
    sessionId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
      'string.pattern.base': 'Invalid session ID format',
      'any.required': 'Session ID is required',
    }),
  }),

  // Text refinement schemas
  refineText: Joi.object({
    text: Joi.string().min(10).max(5000).trim().required().messages({
      'string.min': 'Text must be at least 10 characters',
      'string.max': 'Text cannot exceed 5000 characters',
      'string.empty': 'Text is required',
      'any.required': 'Text is required',
    }),
    tone: Joi.string().valid('formal', 'casual', 'friendly', 'professional').required().messages({
      'any.only': 'Tone must be one of: formal, casual, friendly, professional',
      'any.required': 'Tone is required',
    }),
    sessionId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional().messages({
      'string.pattern.base': 'Invalid session ID format',
    }),
  }),

  // User preferences schemas
  updatePreferences: Joi.object({
    theme: Joi.string().valid('light', 'dark').optional().messages({
      'any.only': 'Theme must be either light or dark',
    }),
    defaultTone: Joi.string().valid('formal', 'casual', 'friendly', 'professional').optional().messages({
      'any.only': 'Default tone must be one of: formal, casual, friendly, professional',
    }),
  }).min(1).messages({
    'object.min': 'At least one preference field must be provided',
  }),

  // Query parameter schemas
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1).messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1',
    }),
    limit: Joi.number().integer().min(1).max(100).default(20).messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100',
    }),
  }),

  // ID parameter schema
  objectId: Joi.object({
    id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
      'string.pattern.base': 'Invalid ID format',
      'any.required': 'ID is required',
    }),
  }),
};

// Custom validation functions
export const customValidators = {
  // Validate email format
  email: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  // Validate password strength
  password: (value: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (value.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    if (!/[A-Z]/.test(value)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(value)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(value)) {
      errors.push('Password must contain at least one number');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Validate text content for refinement
  refinableText: (value: string): { isValid: boolean; error?: string } => {
    if (!value || !value.trim()) {
      return { isValid: false, error: 'Text cannot be empty' };
    }

    if (value.length > 5000) {
      return { isValid: false, error: 'Text is too long (max 5000 characters)' };
    }

    if (value.length < 10) {
      return { isValid: false, error: 'Text is too short (min 10 characters)' };
    }

    // Check if text contains meaningful content
    const meaningfulChars = value.replace(/[^a-zA-Z0-9\s]/g, '').length;
    if (meaningfulChars < 5) {
      return { isValid: false, error: 'Text must contain meaningful content' };
    }

    return { isValid: true };
  },

  // Sanitize HTML input
  sanitizeHtml: (value: string): string => {
    // Basic HTML sanitization - in production, use a library like DOMPurify
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  },
};