import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User as FirebaseUser,
  getIdToken
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { apiService } from '../services/api';
import { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = firebaseOnAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          // Get Firebase ID token
          const idToken = await getIdToken(firebaseUser);

          try {
            // Authenticate with backend
            const authResponse = await apiService.login(idToken);
            apiService.setToken(authResponse.token);

            setAuthState({
              user: authResponse.user,
              isLoading: false,
              error: null,
            });
          } catch (backendError) {
            // If backend user doesn't exist, register them
            try {
              const authResponse = await apiService.register(idToken, firebaseUser.displayName || 'User');
              apiService.setToken(authResponse.token);

              setAuthState({
                user: authResponse.user,
                isLoading: false,
                error: null,
              });
            } catch (registerError) {
              setAuthState({
                user: null,
                isLoading: false,
                error: 'Failed to authenticate with backend',
              });
            }
          }
        } else {
          // User signed out
          apiService.clearToken();
          setAuthState({
            user: null,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        setAuthState({
          user: null,
          isLoading: false,
          error: 'Authentication error',
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The onAuthStateChanged listener will handle the rest
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to sign in',
      }));
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName: string): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Update display name
      await userCredential.user.updateProfile({ displayName });
      // The onAuthStateChanged listener will handle the rest
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to create account',
      }));
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        error: error.message || 'Failed to sign out',
      }));
    }
  };

  const value: AuthContextType = {
    ...authState,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};