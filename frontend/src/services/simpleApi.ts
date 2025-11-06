import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { RefineRequest, RefineResponse, ChatSession } from '../types';

class SimpleApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error);
        if (error.response?.status === 503) {
          throw new Error('AI service temporarily unavailable. Please try again later.');
        }
        if (error.response?.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        }
        throw error;
      }
    );
  }

  // Text refinement
  async refineText(request: RefineRequest): Promise<RefineResponse & { sessionId: string }> {
    try {
      const response: AxiosResponse<{ success: boolean; data: RefineResponse & { sessionId: string } }> =
        await this.client.post('/api/refine', request);
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Chat sessions
  async getChatSessions(): Promise<ChatSession[]> {
    try {
      const response: AxiosResponse<{ success: boolean; data: { sessions: ChatSession[] } }> =
        await this.client.get('/api/sessions');
      return response.data.data.sessions;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createChatSession(title?: string): Promise<ChatSession> {
    try {
      const response: AxiosResponse<{ success: boolean; data: { session: ChatSession } }> =
        await this.client.post('/api/sessions', { title });
      return response.data.data.session;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getChatSession(sessionId: string): Promise<ChatSession> {
    try {
      const response: AxiosResponse<{ success: boolean; data: { session: ChatSession } }> =
        await this.client.get(`/api/sessions/${sessionId}`);
      return response.data.data.session;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteChatSession(sessionId: string): Promise<void> {
    try {
      await this.client.delete(`/api/sessions/${sessionId}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get supported tones
  async getTones(): Promise<Array<{ value: string; label: string; description: string }>> {
    try {
      const response = await this.client.get('/api/tones');
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; services: { openai: string } }> {
    try {
      const response = await this.client.get('/api/health');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handling helper
  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error || error.message || 'An unknown error occurred';
      return new Error(message);
    }
    return error instanceof Error ? error : new Error('An unexpected error occurred');
  }
}

export const simpleApiService = new SimpleApiService();
export default simpleApiService;