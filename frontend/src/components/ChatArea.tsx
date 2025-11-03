import React, { useEffect, useRef } from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { MessageBubble } from './MessageBubble';

interface ChatAreaProps {
  className?: string;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ className = '' }) => {
  const { currentSession, isLoading, error, clearError } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages]);

  const handleDismissError = () => {
    clearError();
  };

  return (
    <div className={`flex-1 flex flex-col bg-gray-50 dark:bg-gray-950 ${className}`}>
      {/* Error Display */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Error
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                {error}
              </p>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={handleDismissError}
                className="inline-flex text-red-400 hover:text-red-600 focus:outline-none"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto">
        {currentSession ? (
          <div className="p-4 space-y-4">
            {currentSession.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Start a conversation
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                  Ask me to refine your text in different tones. Try something like:
                </p>
                <div className="mt-4 space-y-2 text-left">
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      "Make this email more professional: Hey boss, can't come in tomorrow, feeling sick."
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      "Rewrite this to be more friendly: The meeting is mandatory."
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {currentSession.messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-blue"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Refining your text...
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <Sparkles className="w-20 h-20 text-primary-blue mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Welcome to LexiFix
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mb-8">
              Your AI-powered text refinement assistant. Transform your writing into professional, casual, friendly, or formal tone.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full px-4">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-purple-600 dark:text-purple-400 font-semibold">F</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Formal</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Perfect for business communications and academic writing
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-green-600 dark:text-green-400 font-semibold">C</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Casual</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Great for informal conversations and social media
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-yellow-600 dark:text-yellow-400 font-semibold">Fr</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Friendly</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Warm and approachable tone for customer service
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">P</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Professional</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Business-appropriate language for workplace communication
                </p>
              </div>
            </div>

            <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
              Click "New Chat" to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Import Bot icon for the loading indicator
import { Bot } from 'lucide-react';