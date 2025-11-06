import { useState, useEffect, useCallback } from 'react';
import { simpleApiService } from '../services/simpleApi';
import { ChatState, ChatSession, Message, RefineRequest, Tone } from '../types';

export const useSimpleChat = () => {
  const [chatState, setChatState] = useState<ChatState>({
    sessions: [],
    currentSession: null,
    isLoading: false,
    error: null,
  });

  // Load chat sessions on mount
  useEffect(() => {
    loadChatSessions();
  }, []);

  const loadChatSessions = async () => {
    try {
      setChatState(prev => ({ ...prev, isLoading: true, error: null }));
      const sessions = await simpleApiService.getChatSessions();
      setChatState(prev => ({ ...prev, sessions, isLoading: false }));
    } catch (error: any) {
      setChatState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to load chat sessions',
      }));
    }
  };

  const createNewSession = async (title?: string) => {
    try {
      setChatState(prev => ({ ...prev, isLoading: true, error: null }));
      const newSession = await simpleApiService.createChatSession(title);

      setChatState(prev => ({
        ...prev,
        sessions: [newSession, ...prev.sessions],
        currentSession: newSession,
        isLoading: false,
      }));

      return newSession;
    } catch (error: any) {
      setChatState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to create chat session',
      }));
      throw error;
    }
  };

  const loadSession = async (sessionId: string) => {
    try {
      setChatState(prev => ({ ...prev, isLoading: true, error: null }));
      const session = await simpleApiService.getChatSession(sessionId);

      setChatState(prev => ({
        ...prev,
        currentSession: session,
        isLoading: false,
      }));
    } catch (error: any) {
      setChatState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to load chat session',
      }));
      throw error;
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      await simpleApiService.deleteChatSession(sessionId);

      setChatState(prev => ({
        ...prev,
        sessions: prev.sessions.filter(s => s.id !== sessionId),
        currentSession: prev.currentSession?.id === sessionId ? null : prev.currentSession,
      }));
    } catch (error: any) {
      setChatState(prev => ({
        ...prev,
        error: error.message || 'Failed to delete chat session',
      }));
      throw error;
    }
  };

  const refineText = async (request: RefineRequest) => {
    try {
      setChatState(prev => ({ ...prev, isLoading: true, error: null }));

      // If no session ID provided, create a new session
      let sessionId = request.sessionId;
      if (!sessionId) {
        const newSession = await createNewSession();
        sessionId = newSession.id;
      }

      // Add user message to current session
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: request.text,
        timestamp: new Date().toISOString(),
      };

      // Call AI refinement API
      const response = await simpleApiService.refineText({ ...request, sessionId });

      // Add AI message to current session
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.refinedText,
        originalText: response.originalText,
        refinedText: response.refinedText,
        tone: response.tone,
        timestamp: new Date().toISOString(),
        metadata: response.metadata,
      };

      // Update current session with new messages
      setChatState(prev => {
        if (!prev.currentSession || prev.currentSession.id !== sessionId) {
          return prev;
        }

        const updatedSession: ChatSession = {
          ...prev.currentSession,
          messages: [...prev.currentSession.messages, userMessage, aiMessage],
          updatedAt: new Date().toISOString(),
          // Update title if this is the first message
          title: prev.currentSession.messages.length === 0
            ? request.text.slice(0, 50) + (request.text.length > 50 ? '...' : '')
            : prev.currentSession.title,
        };

        return {
          ...prev,
          currentSession: updatedSession,
          sessions: prev.sessions.map(s =>
            s.id === sessionId ? updatedSession : s
          ),
          isLoading: false,
        };
      });

      return response;
    } catch (error: any) {
      setChatState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to refine text',
      }));
      throw error;
    }
  };

  const clearError = useCallback(() => {
    setChatState(prev => ({ ...prev, error: null }));
  }, []);

  const clearCurrentSession = useCallback(() => {
    setChatState(prev => ({ ...prev, currentSession: null }));
  }, []);

  return {
    ...chatState,
    loadChatSessions,
    createNewSession,
    loadSession,
    deleteSession,
    refineText,
    clearError,
    clearCurrentSession,
  };
};