export type ToneType = 'formal' | 'casual' | 'friendly' | 'professional';

export interface OpenAIRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
}

export interface OpenAIResponse {
  choices: Array<{
    message?: {
      content?: string;
    };
  }>;
  usage: {
    total_tokens: number;
  };
}

export interface MessageMetadata {
  model: string;
  tokensUsed: number;
  processingTime: number;
}

export interface Session {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  originalText?: string;
  refinedText?: string;
  tone?: string;
  timestamp: Date;
  metadata?: MessageMetadata;
}