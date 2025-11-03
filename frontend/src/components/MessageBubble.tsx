import React, { useState } from 'react';
import { Copy, Check, User, Bot } from 'lucide-react';
import { Message } from '../types';
import { copyToClipboard, formatDateTime } from '../utils/helpers';
import { TONE_OPTIONS } from '../utils/helpers';

interface MessageBubbleProps {
  message: Message;
  className?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, className = '' }) => {
  const [copied, setCopied] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  const handleCopy = async () => {
    const textToCopy = message.type === 'ai' ? message.refinedText || message.content : message.content;
    const success = await copyToClipboard(textToCopy);

    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getToneLabel = (toneValue: string) => {
    const tone = TONE_OPTIONS.find(t => t.value === toneValue);
    return tone?.label || toneValue;
  };

  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'formal':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'casual':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'friendly':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'professional':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4 ${className}`}>
      <div className={`flex items-start space-x-3 max-w-2xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
          ${message.type === 'user'
            ? 'bg-primary-blue text-white ml-3'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 mr-3'
          }
        `}>
          {message.type === 'user' ? (
            <User className="w-4 h-4" />
          ) : (
            <Bot className="w-4 h-4" />
          )}
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
          {/* Message Bubble */}
          <div
            className={`
              message-bubble relative group
              ${message.type === 'user'
                ? 'user-message'
                : 'ai-message'
              }
            `}
          >
            {/* Tone indicator for AI messages */}
            {message.type === 'ai' && message.tone && (
              <div className="absolute -top-2 left-2 z-10">
                <span className={`
                  inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                  ${getToneColor(message.tone)}
                `}>
                  {getToneLabel(message.tone)}
                </span>
              </div>
            )}

            {/* Message text */}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {message.type === 'ai' && message.originalText && message.refinedText && showOriginal ? (
                <div>
                  <p className="text-gray-600 dark:text-gray-400 italic mb-2">
                    Original: {message.originalText}
                  </p>
                  <hr className="my-2 border-gray-300 dark:border-gray-600" />
                  <p>{message.refinedText}</p>
                </div>
              ) : (
                <p>{message.content}</p>
              )}
            </div>

            {/* Copy button */}
            {message.type === 'ai' && (
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-white dark:bg-gray-700 shadow-sm hover:shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200"
                aria-label={copied ? 'Copied!' : 'Copy text'}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
                )}
              </button>
            )}

            {/* Toggle original/refined text for AI messages */}
            {message.type === 'ai' && message.originalText && message.refinedText && (
              <button
                onClick={() => setShowOriginal(!showOriginal)}
                className="absolute bottom-2 right-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline"
              >
                {showOriginal ? 'Show refined only' : 'Show original & refined'}
              </button>
            )}
          </div>

          {/* Timestamp */}
          <div className={`
            mt-1 text-xs text-gray-500 dark:text-gray-400
            ${message.type === 'user' ? 'text-right' : 'text-left'}
          `}>
            {formatDateTime(message.timestamp)}
            {message.metadata && (
              <span className="ml-2">
                • {message.metadata.tokensUsed} tokens
                {message.metadata.processingTime && (
                  <span> • {Math.round(message.metadata.processingTime * 1000)}ms</span>
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};