import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import { UserPreferences } from '../types';
import { User, Mail, Palette, Globe, Shield } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'light',
    defaultTone: 'professional',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (user) {
      setPreferences(user.preferences);
    }
  }, [user]);

  const handleSavePreferences = async () => {
    if (!user) return;

    setIsLoading(true);
    setSaveMessage('');

    try {
      await apiService.updateUserPreferences(preferences);
      setSaveMessage('Preferences saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Failed to save preferences');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Settings
        </h1>

        {/* Profile Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center space-x-3 mb-6">
            <User className="w-6 h-6 text-primary-blue" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Profile
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 bg-primary-blue rounded-full flex items-center justify-center text-white text-xl font-medium">
                {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {user.displayName || 'User'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Member since: {new Date(user.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Last login: {new Date(user.lastLoginAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center space-x-3 mb-6">
            <Palette className="w-6 h-6 text-primary-blue" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Preferences
            </h2>
          </div>

          <div className="space-y-6">
            {/* Theme Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Theme
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPreferences(prev => ({ ...prev, theme: 'light' }))}
                  className={`
                    p-4 rounded-lg border-2 transition-all duration-200
                    ${preferences.theme === 'light'
                      ? 'border-primary-blue bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }
                  `}
                >
                  <div className="text-center">
                    <div className="w-8 h-8 bg-white border border-gray-300 rounded-lg mx-auto mb-2"></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Light</span>
                  </div>
                </button>

                <button
                  onClick={() => setPreferences(prev => ({ ...prev, theme: 'dark' }))}
                  className={`
                    p-4 rounded-lg border-2 transition-all duration-200
                    ${preferences.theme === 'dark'
                      ? 'border-primary-blue bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }
                  `}
                >
                  <div className="text-center">
                    <div className="w-8 h-8 bg-gray-900 border border-gray-600 rounded-lg mx-auto mb-2"></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Dark</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Default Tone Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Default Tone for Text Refinement
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'formal', label: 'Formal', color: 'purple' },
                  { value: 'casual', label: 'Casual', color: 'green' },
                  { value: 'friendly', label: 'Friendly', color: 'yellow' },
                  { value: 'professional', label: 'Professional', color: 'blue' },
                ].map((tone) => (
                  <button
                    key={tone.value}
                    onClick={() => setPreferences(prev => ({ ...prev, defaultTone: tone.value as any }))}
                    className={`
                      p-3 rounded-lg border-2 transition-all duration-200
                      ${preferences.defaultTone === tone.value
                        ? `border-${tone.color}-500 bg-${tone.color}-50 dark:bg-${tone.color}-900/20`
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }
                    `}
                  >
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {tone.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-6 flex items-center justify-between">
            <div>
              {saveMessage && (
                <p className={`text-sm ${saveMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                  {saveMessage}
                </p>
              )}
            </div>
            <button
              onClick={handleSavePreferences}
              disabled={isLoading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Globe className="w-6 h-6 text-primary-blue" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              About LexiFix
            </h2>
          </div>

          <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
            <p>
              LexiFix is an AI-powered text refinement tool that helps you transform your writing into different tones and styles.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Features:</h4>
                <ul className="space-y-1">
                  <li>• AI-powered text refinement</li>
                  <li>• Multiple tone options</li>
                  <li>• Chat history persistence</li>
                  <li>• Dark mode support</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Technology:</h4>
                <ul className="space-y-1">
                  <li>• Powered by GPT-4</li>
                  <li>• Firebase authentication</li>
                  <li>• MongoDB database</li>
                  <li>• React + TypeScript</li>
                </ul>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p>Version 1.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};