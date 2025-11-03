// User & Authentication Types
export interface User {
  id: string;
  email: string;
  displayName: string;
  preferences: UserPreferences;
  createdAt: string;
  lastLoginAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  defaultTone: 'formal' | 'casual' | 'friendly' | 'professional';
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

// Chat & Message Types
export interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  originalText?: string; // Only for AI messages
  refinedText?: string; // Only for AI messages
  tone?: string; // Only for AI messages
  timestamp: string;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  model: string;
  tokensUsed: number;
  processingTime: number;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export interface ChatState {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  isLoading: boolean;
  error: string | null;
}

// API Request/Response Types
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

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  error: string;
  code: string;
  details?: any;
}

// UI Component Types
export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export interface NotificationType {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

// Utility Types
export type Tone = 'formal' | 'casual' | 'friendly' | 'professional';
export type Theme = 'light' | 'dark';
export type MessageRole = 'user' | 'ai';

// Firebase Types
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
  measurementId?: string;
}