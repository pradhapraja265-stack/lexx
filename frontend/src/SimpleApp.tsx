import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './hooks/useTheme';
import { SimpleHomePage } from './pages/SimpleHomePage';
import './index.css';

// Loading component
const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
    <div className="text-center">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary-blue border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-16 h-16 border-4 border-primary-purple border-b-transparent rounded-full animate-spin animation-delay-150"></div>
      </div>
      <p className="mt-4 text-gray-600 dark:text-gray-400 animate-pulse">Loading LexiFix...</p>
    </div>
  </div>
);

// Main App content
const SimpleAppContent: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SimpleHomePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

function SimpleApp() {
  return (
    <ThemeProvider>
      <Suspense fallback={<LoadingSpinner />}>
        <SimpleAppContent />
      </Suspense>
    </ThemeProvider>
  );
}

export default SimpleApp;