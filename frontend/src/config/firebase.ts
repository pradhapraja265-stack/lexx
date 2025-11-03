import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { FirebaseConfig } from '../types';

// Firebase configuration
const firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Disable reauthentication for development
if (import.meta.env.DEV) {
  auth.settings.appVerificationDisabledForTesting = true;
}

export default app;