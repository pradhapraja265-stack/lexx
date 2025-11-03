import React, { useState, useRef, useEffect } from 'react';
import { Send, ChevronDown } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../hooks/useAuth';
import { TONE_OPTIONS, MAX_INPUT_LENGTH } from '../utils/helpers';
import { Tone } from '../types';

interface InputAreaProps {
  className?: string;
}

export const InputArea: React.FC<InputAreaProps> = ({ className = '' }) => {
  const { currentSession, refineText, isLoading } = useChat();
  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const [selectedTone, setSelectedTone] = useState<Tone>('professional');
  const [isToneDropdownOpen, setIsToneDropdownOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  }, [inputText]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsToneDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputText.trim() || isLoading || !user) return;

    try {
      await refineText({
        text: inputText.trim(),
        tone: selectedTone,
        sessionId: currentSession?.id,
      });
      setInputText('');
    } catch (error) {
      console.error('Failed to refine text:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const getToneColor = (tone: Tone) => {
    switch (tone) {
      case 'formal':
        return 'text-purple-600 bg-purple-50 border-purple-200 hover:bg-purple-100 dark:bg-purple-900/20 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/30';
      case 'casual':
        return 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/30';
      case 'friendly':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-400 dark:hover:bg-yellow-900/30';
      case 'professional':
        return 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/30';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100 dark:bg-gray-900/20 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-900/30';
    }
  };

  const getSelectedToneInfo = () => {
    return TONE_OPTIONS.find(tone => tone.value === selectedTone) || TONE_OPTIONS[3]; // Default to professional
  };

  const isDisabled = !inputText.trim() || isLoading || !user;

  return (
    <div className={`border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 ${className}`}>
      <div className="max-w-4xl mx-auto p-4">
        {!user && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Please sign in to start refining your text.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tone Selector */}
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Tone:
            </label>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsToneDropdownOpen(!isToneDropdownOpen)}
                disabled={isLoading}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors
                  ${getToneColor(selectedTone)}
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <span className="font-medium">{getSelectedToneInfo().label}</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {isToneDropdownOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-10">
                  {TONE_OPTIONS.map((tone) => (
                    <button
                      key={tone.value}
                      type="button"
                      onClick={() => {
                        setSelectedTone(tone.value);
                        setIsToneDropdownOpen(false);
                      }}
                      className={`
                        w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                        ${selectedTone === tone.value ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-primary-blue' : ''}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {tone.label}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {tone.description}
                          </div>
                        </div>
                        {selectedTone === tone.value && (
                          <div className="w-2 h-2 bg-primary-blue rounded-full"></div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value.slice(0, MAX_INPUT_LENGTH))}
              onKeyDown={handleKeyDown}
              placeholder="Enter text you want to refine..."
              disabled={!user || isLoading}
              className={`
                w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                placeholder-gray-500 dark:placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent
                resize-none min-h-[60px] max-h-[200px]
                ${(!user || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              rows={1}
            />

            {/* Character count */}
            <div className="absolute bottom-2 left-4 text-xs text-gray-400">
              {inputText.length} / {MAX_INPUT_LENGTH}
            </div>

            {/* Send button */}
            <button
              type="submit"
              disabled={isDisabled}
              className={`
                absolute bottom-2 right-2 p-2 rounded-lg transition-all duration-200
                ${isDisabled
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : 'bg-primary-blue hover:bg-blue-600 text-white shadow-sm hover:shadow-md'
                }
              `}
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          {/* Tips */}
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Press Enter to send, Shift+Enter for new line
          </div>
        </form>
      </div>
    </div>
  );
};