import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ThemeProvider } from './hooks/useTheme';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SettingsPage } from './pages/SettingsPage';
import './index.css';

// Loading component
const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public route component (redirects to home if already authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return !user ? <>{children}</> : <Navigate to="/" replace />;
};

// Main App content
const AppContent: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <LoginPage onAuthSuccess={() => window.location.href = '/'} />
          </PublicRoute>
        } />

        <Route path="/" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <AppContent />
        </Suspense>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
