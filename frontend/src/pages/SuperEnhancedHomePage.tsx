import React, { useState, useEffect, useRef } from 'react';
import { Moon, Sun, Menu, X, Sparkles, MessageSquare, Copy, Check, Trash2, Plus, Zap, Star, Heart, Send, Loader2 } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useSimpleChat } from '../hooks/useSimpleChat';
import { TONE_OPTIONS } from '../utils/helpers';

export const SuperEnhancedHomePage: React.FC = () => {
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
  [isToneDropdownOpen, setIsToneDropdownOpen] = useState(false);
  [copiedId, setCopiedId] = useState<string | null>(null);
  [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; color: string }>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredTone, setHoveredTone] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Generate particles
  useEffect(() => {
    const generateParticles = () => {
      const newParticles = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 4 + 1,
        color: ['blue', 'purple', 'pink', 'indigo', 'cyan'][Math.floor(Math.random() * 5)],
      }));
      setParticles(newParticles);
    };

    generateParticles();
    const interval = setInterval(generateParticles, 10000);
    return () => clearInterval(interval);
  }, []);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  }, [inputText]);

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

    setIsTyping(true);
    try {
      await refineText({
        text: inputText.trim(),
        tone: selectedTone as any,
        sessionId: currentSession?.id,
      });
      setInputText('');
    } catch (error) {
      console.error('Failed to refine text:', error);
    } finally {
      setIsTyping(false);
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

  const handleToneHover = (tone: string) => {
    setHoveredTone(tone);
  };

  const handleInputFocus = () => {
    inputRef.current?.classList.add('neon-border');
  };

  const handleInputBlur = () => {
    inputRef.current?.classList.remove('neon-border');
  };

  const getToneGradient = (tone: string) => {
    const gradients = {
      formal: 'from-purple-500 via-pink-500 to-rose-500',
      casual: 'from-green-500 via-emerald-500 to-teal-500',
      friendly: 'from-yellow-400 via-orange-400 to-red-500',
      professional: 'from-blue-500 via-cyan-500 to-indigo-500',
    };
    return gradients[tone as keyof typeof gradients] || gradients.professional;
  };

  const getToneIcon = (tone: string) => {
    const icons = {
      formal: '🎩',
      casual: '😎',
      friendly: '😊',
      professional: '💼',
    };
    return icons[tone as keyof typeof icons] || '✨';
  };

  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      {/* Animated Background Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle animate-float"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: `${particle.id * 0.5}s`,
            animationDuration: `${15 + particle.id * 2}s`,
          }}
        />
      ))}

      {/* Enhanced Navbar */}
      <nav className="relative z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/30 dark:border-gray-700/30 px-4 py-4 shadow-2xl">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo and Menu */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleMobileMenuToggle}
              className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 hover:scale-110 shadow-md hover:shadow-xl lg:hidden"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Sparkles className="w-10 h-10 text-primary-blue animate-float" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse shadow-lg"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold gradient-text text-shadow-lg">LexiFix</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                  Refine your words, redefine your impact.
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 hover:scale-110 shadow-md hover:shadow-lg hover:rotate-180"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <div className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-full">
              <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400 animate-pulse" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">AI Powered</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Enhanced Sidebar */}
        <div className={`
          fixed lg:relative inset-y-0 left-0 w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border-r border-gray-200/30 dark:border-gray-700/30
          transform transition-all duration-500 ease-in-out lg:transform-none
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isSidebarOpen ? 'shadow-2xl' : 'lg:shadow-lg'}
        `}>
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200/30 dark:border-gray-700/30">
            <button
              onClick={handleNewChat}
              disabled={isLoading}
              className="w-full btn-gradient text-lg font-bold py-4 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-500"
            >
              <Plus className="w-6 h-6 mr-2" />
              <span>New Chat</span>
              <span className="ml-2 loading-dots">
                <div></div>
                <div></div>
                <div></div>
              </span>
            </button>
          </div>

          {/* Enhanced Chat Sessions */}
          <div className="flex-1 overflow-y-auto p-4">
            {sessions.length === 0 ? (
              <div className="text-center py-12">
                <div className="relative inline-block">
                  <MessageSquare className="w-20 h-20 mx-auto mb-6 text-gray-300 dark:text-gray-600 animate-float" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary-blue to-primary-purple rounded-full animate-pulse"></div>
                  </div>
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-6 animate-slide-up">
                  Start your first conversation
                </p>
                <button
                  onClick={handleNewChat}
                  className="btn-secondary hover-lift transition-all duration-300"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Chatting
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session, index) => (
                  <div
                    key={session.id}
                    className={`
                      group p-5 rounded-2xl cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-1
                      ${currentSession?.id === session.id
                        ? 'bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-pink-900/30 border-2 border-primary-blue shadow-lg animate-slide-up'
                        : 'glass-card hover:scale-105'
                      }
                    `}
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => handleSelectSession(session.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate mb-2 flex items-center">
                          {session.title}
                          {session.messageCount > 0 && (
                            <span className="ml-2 px-2 py-1 bg-gradient-to-r from-primary-blue to-primary-purple text-white text-xs rounded-full">
                              {session.messageCount}
                            </span>
                          )}
                        </h3>
                        <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            {session.messageCount} messages
                          </span>
                          <span>•</span>
                          <span>{new Date(session.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteSession(e, session.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 transition-all duration-300 hover:scale-110"
                      >
                        <Trash2 className="w-5 h-5 text-red-500 hover:text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="p-6 border-t border-gray-200/30 dark:border-gray-700/30">
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 mb-2">
                <Star className="w-4 h-4 text-yellow-500 animate-pulse" />
                <span className="text-xs text-gray-500 dark:text-gray-400">LexiFix AI</span>
                <Heart className="w-4 h-4 text-red-500 animate-pulse-slow" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Powered by GPT-4 • No Database Required
              </p>
            </div>
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
        <div className="flex-1 flex flex-col min-w-0 relative">
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
                  {/* Central Logo with Enhanced Effects */}
                  <div className="relative">
                    <div className="w-32 h-32 bg-gradient-to-r from-primary-blue via-primary-purple to-primary-indigo rounded-3xl flex items-center justify-center shadow-2xl animate-float">
                      <Sparkles className="w-16 h-16 text-white animate-spin-slow" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse shadow-xl"></div>
                    <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-bounce-soft"></div>
                  </div>
                </div>

                <h1 className="text-6xl font-bold mb-4 gradient-text text-shadow-2xl animate-scale-in">
                  Welcome to LexiFix
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
                  Transform your writing with AI-powered text refinement. Choose your tone and watch the magic happen!
                </p>

                {/* Enhanced Tone Selection Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl w-full mb-8">
                  {TONE_OPTIONS.map((tone, index) => (
                    <div
                      key={tone.value}
                      className={`
                        glass-card p-6 text-center cursor-pointer card-hover group relative overflow-hidden
                        ${hoveredTone === tone.value ? 'ring-4 ring-primary-purple/50' : ''}
                      `}
                      style={{ animationDelay: `${index * 150}ms` }}
                      onMouseEnter={() => handleToneHover(tone.value)}
                      onMouseLeave={() => handleToneHover(null)}
                      onClick={() => {
                        setSelectedTone(tone.value);
                        handleNewChat();
                      }}
                    >
                      {/* Gradient Border Effect */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

                      <div className="relative z-10">
                        <div className={`
                          w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${getToneGradient(tone.value)} rounded-2xl flex items-center justify-center text-2xl animate-bounce-soft group-hover:scale-110 transition-transform duration-300 shadow-lg
                        `}>
                          {getToneIcon(tone.value)}
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 capitalize mb-2">
                          {tone.label}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {tone.description}
                        </p>
                        {hoveredTone === tone.value && (
                          <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-primary-blue/20 via-primary-purple/20 to-primary-indigo/20 animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Call to Action */}
                <button
                  onClick={handleNewChat}
                  className="btn-gradient text-xl px-8 py-5 font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-500 relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center">
                    <Zap className="w-6 h-6 mr-3" />
                    Start Refining Text
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                </button>

                {/* Feature Highlights */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
                  <div className="glass-card p-6 text-center card-hover">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl mx-auto mb-3 animate-rotate-slow">
                      ⚡
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Lightning Fast</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get AI-powered refinement in seconds
                    </p>
                  </div>
                  <div className="glass-card p-6 text-center card-hover">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl mx-auto mb-3 animate-float">
                      🎨
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Multiple Tones</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Professional, Casual, Friendly, Formal
                    </p>
                  </div>
                  <div className="glass-card p-6 text-center card-hover">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl mx-auto mb-3 animate-pulse-slow">
                      💎�
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Beautiful UI</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Stunning animations and effects
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6">
                {currentSession.messages.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400 mb-4 animate-slide-up">
                      Start the conversation by entering some text below!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {currentSession.messages.map((message, index) => (
                      <div
                        key={message.id}
                        className={`animate-fade-in ${index === currentSession.messages.length - 1 ? 'slide-up-enter' : ''}`}
                        style={{ animationDelay: `${index * 150}ms` }}
                      >
                        <MessageBubble
                          message={message}
                          className={`${message.type === 'ai' ? 'cursor-pointer hover:scale-105 hover:-translate-y-1' : ''}`}
                        />
                        {message.type === 'ai' && (
                          <div className="flex justify-center mt-3">
                            <button
                              onClick={() => handleCopy(message.content, message.id)}
                              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-blue to-primary-purple text-white rounded-full hover:from-primary-purple hover:to-primary-blue transition-all duration-300 hover:scale-110 hover:shadow-lg group"
                            >
                              {copiedId === message.id ? (
                                <>
                                  <Check className="w-4 h-4" />
                                  <span className="text-sm font-medium">Copied!</span>
                                  <div className="absolute inset-0 bg-white/30 rounded-full animate-ping"></div>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4" />
                                  <span className="text-sm font-medium">Copy</span>
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
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-gradient-to-r from-primary-blue to-primary-purple rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gradient-to-r from-primary-purple to-primary-indigo rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                              <div className="w-2 h-2 bg-gradient-to-r from-primary-indigo to-primary-blue rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
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
          <div className="border-t border-gray-200/30 dark:border-gray-700/30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
            <div className="max-w-4xl mx-auto p-6">
              <form onSubmit={handleRefineText} className="space-y-4">
                {/* Enhanced Tone Selector */}
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tone:
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsToneDropdownOpen(!isToneDropdownOpen)}
                      onMouseEnter={() => handleToneHover(selectedTone)}
                      onMouseLeave={() => handleToneHover(null)}
                      disabled={isLoading}
                      className={`
                        flex items-center space-x-3 px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-xl
                        ${hoveredTone === selectedTone || isToneDropdownOpen ? 'border-primary-blue dark:border-primary-purple' : 'border-gray-300 dark:border-gray-600'}
                        ${hoveredTone === selectedTone || isToneDropdownOpen ? 'shadow-lg shadow-primary-blue/20 dark:shadow-primary-purple/20' : 'shadow-md'}
                        transition-all duration-300 hover:scale-105 transform
                        relative overflow-hidden
                      `}
                    >
                      <div className={`
                        w-8 h-8 bg-gradient-to-r ${getToneGradient(selectedTone)} rounded-full flex items-center justify-center text-white animate-bounce-soft
                        ${hoveredTone === selectedTone ? 'animate-pulse' : ''}
                      `}>
                        {getToneIcon(selectedTone)}
                      </div>
                      <div className="text-left">
                        <span className="font-medium capitalize text-gray-900 dark:text-gray-100">
                          {selectedTone}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 block">
                          {TONE_OPTIONS.find(t => t.value === selectedTone)?.description}
                        </span>
                      </div>
                      <span className={`transform transition-transform duration-200 ${isToneDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
                      {hoveredTone === selectedTone && (
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-blue/10 via-primary-purple/10 to-primary-indigo/10 animate-pulse"></div>
                      )}
                    </button>

                    {isToneDropdownOpen && (
                      <div className="absolute bottom-full left-0 mb-2 w-72 glass-card shadow-2xl animate-scale-in z-20">
                        {TONE_OPTIONS.map((tone) => (
                          <button
                            key={tone.value}
                            type="button"
                            onClick={() => {
                              setSelectedTone(tone.value);
                              setIsToneDropdownOpen(false);
                            }}
                            onMouseEnter={() => handleToneHover(tone.value)}
                            onMouseLeave={() => handleToneHover(null)}
                            className={`
                              w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200
                              ${selectedTone === tone.value ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20' : ''}
                            ${hoveredTone === tone.value ? 'scale-105 transform' : ''}
                            `}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center space-x-2">
                                  <div className={`w-6 h-6 bg-gradient-to-r ${getToneGradient(tone.value)} rounded-full flex items-center justify-center text-white`}>
                                    {getToneIcon(tone.value)}
                                  </div>
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                                    {tone.label}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {tone.description}
                                  </div>
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

                {/* Enhanced Input Area */}
                <div className="relative">
                  <textarea
                    ref={inputRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    placeholder={isTyping ? "AI is working on your text..." : "Enter text you want to refine..."}
                    disabled={isLoading || isTyping}
                    className="w-full px-4 py-4 pr-14 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-primary-blue/50 dark:focus:ring-primary-purple/50 focus:border-transparent resize-none min-h-[80px] max-h-[300px] transition-all duration-300"
                    rows={1}
                  />

                  {/* Character Count */}
                  <div className="absolute bottom-3 left-4 text-xs text-gray-400">
                    <span className={inputText.length > 4000 ? 'text-red-500' : ''}>
                      {inputText.length} / 5000
                    </span>
                  </div>

                  {/* Enhanced Send Button */}
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isLoading || isTyping}
                    className={`
                      absolute bottom-3 right-3 p-3 rounded-xl transition-all duration-300
                      ${inputText.trim() && !isLoading && !isTyping
                        ? 'bg-gradient-to-r from-primary-blue via-primary-purple to-primary-indigo hover:from-primary-indigo hover:via-primary-blue hover:to-primary-purple text-white shadow-lg hover:shadow-xl hover:scale-110 hover:-translate-y-1'
                        : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      }
                      transform transition-transform duration-300
                    `}
                  >
                    {isLoading || isTyping ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Enhanced Tips */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <span>Press Enter to send</span>
                    <span>•</span>
                    <span>Shift+Enter for new line</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center">
                      <Zap className="w-3 h-3 text-purple-500 animate-pulse" />
                    </span>
                    <span className="hidden sm:block">AI Enhanced</span>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Mouse follower effect */}
      <div
        className="fixed w-6 h-6 bg-gradient-to-r from-primary-blue to-primary-purple rounded-full opacity-20 pointer-events-none animate-pulse"
        style={{
          left: `${mousePosition.x - 12}px`,
          top: `${mousePosition.y - 12}px`,
          transition: 'all 0.3s ease-out',
        }}
      />
    </div>
  );
};