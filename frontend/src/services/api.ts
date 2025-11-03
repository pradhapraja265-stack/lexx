import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  AuthResponse,
  RefineRequest,
  RefineResponse,
  User,
  ChatSession,
  ApiError,
  UserPreferences
} from '../types';

class ApiService {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle common errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.clearToken();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );

    // Load token from localStorage
    const savedToken = localStorage.getItem('lexifix_token');
    if (savedToken) {
      this.setToken(savedToken);
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('lexifix_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('lexifix_token');
  }

  // Authentication Methods
  async login(firebaseToken: string): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.client.post('/api/auth/login', {
        firebaseToken,
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async register(firebaseToken: string, displayName: string): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.client.post('/api/auth/register', {
        firebaseToken,
        displayName,
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // Chat Methods
  async getChatSessions(): Promise<ChatSession[]> {
    try {
      const response: AxiosResponse<{ sessions: ChatSession[] }> = await this.client.get('/api/chat/sessions');
      return response.data.sessions;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async createChatSession(title?: string): Promise<ChatSession> {
    try {
      const response: AxiosResponse<{ session: ChatSession }> = await this.client.post('/api/chat/sessions', {
        title,
      });
      return response.data.session;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async getChatSession(sessionId: string): Promise<ChatSession> {
    try {
      const response: AxiosResponse<{ session: ChatSession }> = await this.client.get(`/api/chat/sessions/${sessionId}`);
      return response.data.session;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async deleteChatSession(sessionId: string): Promise<void> {
    try {
      await this.client.delete(`/api/chat/sessions/${sessionId}`);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // Text Refinement Methods
  async refineText(request: RefineRequest): Promise<RefineResponse> {
    try {
      const response: AxiosResponse<RefineResponse> = await this.client.post('/api/refine', request);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // User Methods
  async getUserProfile(): Promise<User> {
    try {
      const response: AxiosResponse<{ user: User }> = await this.client.get('/api/user/profile');
      return response.data.user;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async updateUserPreferences(preferences: UserPreferences): Promise<UserPreferences> {
    try {
      const response: AxiosResponse<{ preferences: UserPreferences }> = await this.client.put('/api/user/preferences', preferences);
      return response.data.preferences;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await this.client.get('/api/health');
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // Error handling helper
  private handleError(error: any): never {
    if (axios.isAxiosError(error)) {
      const apiError: ApiError = {
        error: error.response?.data?.error || error.message || 'An unknown error occurred',
        code: error.response?.data?.code || 'UNKNOWN_ERROR',
        details: error.response?.data?.details,
      };
      throw apiError;
    }
    throw error;
  }
}

// Create singleton instance
export const apiService = new ApiService();
export default apiService;