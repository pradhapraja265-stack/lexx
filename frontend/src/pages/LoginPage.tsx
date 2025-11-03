import React from 'react';
import { AuthPages } from '../components/AuthPages';

interface LoginPageProps {
  onAuthSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onAuthSuccess }) => {
  return <AuthPages onAuthSuccess={onAuthSuccess} />;
};