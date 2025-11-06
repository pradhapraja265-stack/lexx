import React, { useState } from 'react';
import { Moon, Sun, Menu, X, Sparkles, MessageSquare, Copy, Check, Trash2, Plus } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useSimpleChat } from '../hooks/useSimpleChat';
import { MessageBubble } from '../components/MessageBubble';
import { TONE_OPTIONS } from '../utils/helpers';

export const SimpleHomePage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const {
    sessions,
    currentSession,
    isLoading,
    error,
    createNewSession,
    loadSession,
    deleteSession,
    refineText,
    clearError,
  } = useSimpleChat();

  const [inputText, setInputText] = useState('');
  const [selectedTone, setSelectedTone] = useState('professional');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isToneDropdownOpen, setIsToneDropdownOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleMobileMenuToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  const handleNewChat = async () => {
    try {
      await createNewSession();
      handleSidebarClose();
    } catch (error) {
      console.error('Failed to create new chat:', error);
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    try {
      await loadSession(sessionId);
      handleSidebarClose();
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  };

  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat?')) {
      try {
        await deleteSession(sessionId);
      } catch (error) {
        console.error('Failed to delete session:', error);
      }
    }
  };

  const handleRefineText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    try {
      await refineText({
        text: inputText.trim(),
        tone: selectedTone as any,
        sessionId: currentSession?.id,
      });
      setInputText('');
    } catch (error) {
      console.error('Failed to refine text:', error);
    }
  };

  const handleCopy = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Enhanced Navbar */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo and Menu */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleMobileMenuToggle}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-105 lg:hidden"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Sparkles className="w-8 h-8 text-primary-blue animate-float" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-primary-purple to-primary-indigo rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">LexiFix</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                  Refine your words, redefine your impact.
                </p>
              </div>
            </div>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-110 shadow-md hover:shadow-lg"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Enhanced Sidebar */}
        <div className={`
          fixed lg:relative inset-y-0 left-0 z-50 w-80 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50
          transform transition-all duration-300 ease-in-out lg:transform-none
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <button
              onClick={handleNewChat}
              disabled={isLoading}
              className="w-full btn-gradient flex items-center justify-center space-x-2 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              <span>New Chat</span>
            </button>
          </div>

          {/* Chat Sessions */}
          <div className="flex-1 overflow-y-auto p-4">
            {sessions.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600 animate-float" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">No chats yet</p>
                <button
                  onClick={handleNewChat}
                  className="text-primary-blue hover:text-primary-purple font-medium transition-colors duration-200"
                >
                  Start your first conversation
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`
                      group p-4 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1
                      ${currentSession?.id === session.id
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-primary-blue shadow-md'
                        : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 border border-gray-200 dark:border-gray-700'
                      }
                    `}
                    onClick={() => handleSelectSession(session.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate mb-1">
                          {session.title}
                        </h3>
                        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{session.messageCount} messages</span>
                          <span>•</span>
                          <span>{new Date(session.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteSession(e, session.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-all duration-200 hover:scale-110"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={handleSidebarClose}
          />
        )}

        {/* Enhanced Chat Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Error Display */}
          {error && (
            <div className="mx-4 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl shadow-lg animate-slide-down">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <X className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
                <button
                  onClick={clearError}
                  className="flex-shrink-0 text-red-500 hover:text-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto">
            {!currentSession ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12 px-6">
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-gradient-to-r from-primary-blue to-primary-purple rounded-3xl flex items-center justify-center shadow-2xl animate-float">
                    <Sparkles className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse shadow-lg"></div>
                </div>

                <h1 className="text-5xl font-bold mb-4 gradient-text text-shadow-lg">
                  Welcome to LexiFix
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Transform your writing with AI-powered text refinement. Choose your tone and let the magic happen!
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl w-full mb-8">
                  {[
                    { tone: 'formal', icon: '🎩', color: 'from-purple-500 to-purple-700' },
                    { tone: 'casual', icon: '😎', color: 'from-green-500 to-green-700' },
                    { tone: 'friendly', icon: '😊', color: 'from-yellow-500 to-orange-500' },
                    { tone: 'professional', icon: '💼', color: 'from-blue-500 to-blue-700' },
                  ].map((item) => (
                    <div
                      key={item.tone}
                      className="glass-card p-6 text-center card-hover group cursor-pointer"
                      onClick={() => {
                        setSelectedTone(item.tone);
                        handleNewChat();
                      }}
                    >
                      <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center text-2xl mb-3 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                        {item.icon}
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 capitalize mb-1">
                        {item.tone}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Perfect for {item.tone} writing
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleNewChat}
                  className="btn-gradient text-lg px-8 py-4 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  Start Refining Text
                </button>
              </div>
            ) : (
              <div className="p-6">
                {currentSession.messages.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Start the conversation by entering some text below!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {currentSession.messages.map((message, index) => (
                      <div
                        key={message.id}
                        className={`animate-fade-in ${index === currentSession.messages.length - 1 ? 'slide-up-enter' : ''}`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <MessageBubble
                          message={message}
                          className={`${message.type === 'ai' ? 'cursor-pointer hover:scale-105' : ''}`}
                        />
                        {message.type === 'ai' && (
                          <div className="flex justify-center mt-2">
                            <button
                              onClick={() => handleCopy(message.content, message.id)}
                              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105"
                            >
                              {copiedId === message.id ? (
                                <>
                                  <Check className="w-4 h-4 text-green-500" />
                                  <span className="text-sm text-green-500">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm text-gray-500">Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start animate-slide-up">
                        <div className="ai-message">
                          <div className="flex items-center space-x-3">
                            <div className="loading-dots">
                              <div></div>
                              <div></div>
                              <div></div>
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400 typing-indicator">
                              Refining your text
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Enhanced Input Area */}
          <div className="border-t border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg">
            <div className="max-w-4xl mx-auto p-6">
              <form onSubmit={handleRefineText} className="space-y-4">
                {/* Tone Selector */}
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tone:
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsToneDropdownOpen(!isToneDropdownOpen)}
                      disabled={isLoading}
                      className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:border-primary-blue dark:hover:border-primary-purple transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
                    >
                      <span className="font-medium capitalize">{selectedTone}</span>
                      <span className="text-xs text-gray-500">({TONE_OPTIONS.find(t => t.value === selectedTone)?.description})</span>
                      <span className={`transform transition-transform duration-200 ${isToneDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
                    </button>

                    {isToneDropdownOpen && (
                      <div className="absolute bottom-full left-0 mb-2 w-64 glass-card shadow-2xl z-10 animate-scale-in">
                        {TONE_OPTIONS.map((tone) => (
                          <button
                            key={tone.value}
                            type="button"
                            onClick={() => {
                              setSelectedTone(tone.value);
                              setIsToneDropdownOpen(false);
                            }}
                            className={`
                              w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200
                              ${selectedTone === tone.value ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20' : ''}
                            `}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                                  {tone.label}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {tone.description}
                                </div>
                              </div>
                              {selectedTone === tone.value && (
                                <div className="w-2 h-2 bg-gradient-to-r from-primary-blue to-primary-purple rounded-full"></div>
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
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Enter text you want to refine..."
                    disabled={isLoading}
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent resize-none min-h-[60px] max-h-[200px] transition-all duration-200 hover:shadow-md focus:shadow-lg"
                    rows={1}
                  />
                  <div className="absolute bottom-2 left-4 text-xs text-gray-400">
                    {inputText.length} / 5000
                  </div>
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isLoading}
                    className="absolute bottom-2 right-2 p-2 bg-gradient-to-r from-primary-blue to-primary-purple text-white rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110 shadow-lg hover:shadow-xl"
                  >
                    <Sparkles className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Press Enter to send, Shift+Enter for new line
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};