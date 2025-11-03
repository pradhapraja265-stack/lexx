import { Request } from 'express';
import { Document, Types } from 'mongoose';

// User Types
export interface IUser extends Document {
  _id: Types.ObjectId;
  firebaseUid: string;
  email: string;
  displayName: string;
  preferences: UserPreferences;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  defaultTone: 'formal' | 'casual' | 'friendly' | 'professional';
}

export interface CreateUserDto {
  firebaseUid: string;
  email: string;
  displayName: string;
}

export interface UpdateUserPreferencesDto {
  theme?: 'light' | 'dark';
  defaultTone?: 'formal' | 'casual' | 'friendly' | 'professional';
}

// Chat Session Types
export interface IChatSession extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: IMessage[];
}

export interface IMessage {
  _id?: Types.ObjectId;
  id: string;
  type: 'user' | 'ai';
  content: string;
  originalText?: string;
  refinedText?: string;
  tone?: string;
  timestamp: Date;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  model: string;
  tokensUsed: number;
  processingTime: number;
}

export interface CreateChatSessionDto {
  title?: string;
  userId: string;
}

export interface CreateMessageDto {
  sessionId: string;
  type: 'user' | 'ai';
  content: string;
  originalText?: string;
  refinedText?: string;
  tone?: string;
  metadata?: MessageMetadata;
}

// API Request/Response Types
export interface AuthRequest {
  firebaseToken: string;
  displayName?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    displayName: string;
    preferences: UserPreferences;
  };
  token: string;
}

export interface RefineRequest {
  text: string;
  tone: 'formal' | 'casual' | 'friendly' | 'professional';
  sessionId?: string;
}

export interface RefineResponse {
  refinedText: string;
  originalText: string;
  tone: string;
  metadata: MessageMetadata;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Express Types
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    firebaseUid: string;
    email: string;
  };
}

// Error Types
export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
  value?: any;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code: string;
  details?: ValidationErrorDetail[];
  stack?: string; // Only in development
}

// OpenAI Types
export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  temperature: number;
  max_tokens: number;
}

export interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Tone Types
export type ToneType = 'formal' | 'casual' | 'friendly' | 'professional';

export interface ToneInstructions {
  formal: string;
  casual: string;
  friendly: string;
  professional: string;
}

// Database Types
export interface DatabaseConfig {
  uri: string;
  options: {
    maxPoolSize: number;
    serverSelectionTimeoutMS: number;
    socketTimeoutMS: number;
    bufferMaxEntries: number;
    bufferCommands: boolean;
  };
}

// Rate Limiting Types
export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  standardHeaders: boolean;
  legacyHeaders: boolean;
}

// Environment Types
export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  MONGODB_URI: string;
  OPENAI_API_KEY: string;
  JWT_SECRET: string;
  FRONTEND_URL: string;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
}

// JWT Types
export interface JWTPayload {
  id: string;
  firebaseUid: string;
  email: string;
  iat: number;
  exp: number;
}

// Health Check Types
export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  version: string;
  database: 'connected' | 'disconnected';
  openai: 'available' | 'unavailable';
}