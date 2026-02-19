'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/utils/firebase';

export interface UserData {
  userId: string;
  email: string;
  gamname?: string;
  taluka?: string;
  district?: string;
  // createdAt?: any;
  // updatedAt?: any;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, userData: Omit<UserData, 'userId' | 'email' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  user: UserData | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setFirebaseUser(firebaseUser);
        setIsAuthenticated(true);
        
        // Fetch user data from Firestore
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data() as UserData;
            setUser({
              ...userData,
              userId: firebaseUser.uid,
              email: firebaseUser.email || '',
            });
          } else {
            // User document doesn't exist, create it
            const newUserData: UserData = {
              userId: firebaseUser.uid,
              email: firebaseUser.email || '',
              // createdAt: serverTimestamp(),
              // updatedAt: serverTimestamp(),
            };
            await setDoc(userDocRef, newUserData);
            setUser(newUserData);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser({
            userId: firebaseUser.uid,
            email: firebaseUser.email || '',
          });
        }
      } else {
        setFirebaseUser(null);
        setIsAuthenticated(false);
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { success: false, error: 'Please enter a valid email address' };
      }

      // Password validation (minimum 6 characters)
      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
      }

      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      // let errorMessage = 'Login failed. Please try again.';
      
      // if (error.code === 'auth/user-not-found') {
      //   errorMessage = 'No account found with this email. Please sign up first.';
      // } else if (error.code === 'auth/wrong-password') {
      //   errorMessage = 'Incorrect password. Please try again.';
      // } else if (error.code === 'auth/invalid-email') {
      //   errorMessage = 'Invalid email address.';
      // } else if (error.code === 'auth/user-disabled') {
      //   errorMessage = 'This account has been disabled.';
      // } else if (error.code === 'auth/too-many-requests') {
      //   errorMessage = 'Too many failed attempts. Please try again later.';
      // }
      
      return { success: false,  };
    }
  };

  const signup = async (
    email: string, 
    password: string, 
    userData: Omit<UserData, 'userId' | 'email' | 'createdAt' | 'updatedAt'>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { success: false, error: 'Please enter a valid email address' };
      }

      // Password validation (minimum 6 characters)
      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
      }

      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      // Create user document in Firestore
      const userDocRef = doc(db, 'users', userId);
      const newUserData: UserData = {
        userId,
        email,
        ...userData,
        // createdAt: serverTimestamp(),
        // updatedAt: serverTimestamp(),
      };

      await setDoc(userDocRef, newUserData);
      
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      // let errorMessage = 'Signup failed. Please try again.';
      
      // if (error.code === 'auth/email-already-in-use') {
      //   errorMessage = 'This email is already registered. Please login instead.';
      // } else if (error.code === 'auth/invalid-email') {
      //   errorMessage = 'Invalid email address.';
      // } else if (error.code === 'auth/weak-password') {
      //   errorMessage = 'Password is too weak. Please use a stronger password.';
      // }
      
      return { success: false };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      setIsAuthenticated(false);
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      login, 
      signup,
      logout, 
      user,
      firebaseUser,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

