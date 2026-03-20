"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "@/utils/firebase";
import {
  getUserData,
  setUserData,
  isAccessExpired,
  UserData,
} from "@/utils/firestore";

interface LoginResult {
  success: boolean;
  error?: string;
  expired?: boolean;
  user?: UserData;
}

interface SignupResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  isExpired: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  signup: (
    email: string,
    password: string,
    data: Omit<UserData, "userId" | "email">
  ) => Promise<SignupResult>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const data = await getUserData(firebaseUser.uid);

          if (data) {
            const expired = isAccessExpired(data.expiryDate);
            setIsExpired(expired);
            setUser(data);
          } else {
            setUser(null);
            setIsExpired(false);
          }
        } catch (err) {
          console.error("Error fetching user data on auth change:", err);
          setUser(null);
          setIsExpired(false);
        }
      } else {
        setUser(null);
        setIsExpired(false);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<LoginResult> => {
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { success: false, error: "Please enter a valid email address" };
      }

      if (password.length < 6) {
        return {
          success: false,
          error: "Password must be at least 6 characters",
        };
      }

      const res = await signInWithEmailAndPassword(auth, email, password);
      const data = await getUserData(res.user.uid);

      if (!data) {
        return { success: false, error: "User profile not found in database." };
      }

      const expired = isAccessExpired(data.expiryDate);
      setIsExpired(expired);
      setUser(data);

      if (expired) {
        return {
          success: false,
          expired: true,
          error: "Your access has expired. Please contact the administrator.",
          user: data,
        };
      }

      return { success: true, user: data };
    } catch (err: any) {
      console.error("Login error:", err);

      const codeMessages: Record<string, string> = {
        "auth/user-not-found": "No account found with this email.",
        "auth/wrong-password": "Incorrect password. Please try again.",
        "auth/invalid-credential":
          "Invalid email or password. Please try again.",
        "auth/invalid-email": "Invalid email address.",
        "auth/user-disabled": "This account has been disabled.",
        "auth/too-many-requests":
          "Too many failed attempts. Please try again later.",
      };

      return {
        success: false,
        error: codeMessages[err.code] || "Login failed. Please try again.",
      };
    }
  };

  const signup = async (
    email: string,
    password: string,
    data: Omit<UserData, "userId" | "email">
  ): Promise<SignupResult> => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      const userData: UserData = {
        userId: res.user.uid,
        email,
        ...data,
      };

      await setUserData(userData);
      setUser(userData);
      setIsExpired(false);

      return { success: true };
    } catch (err: any) {
      console.error("Signup error:", err);

      const codeMessages: Record<string, string> = {
        "auth/email-already-in-use":
          "This email is already registered. Please login instead.",
        "auth/invalid-email": "Invalid email address.",
        "auth/weak-password":
          "Password is too weak. Please use a stronger password.",
      };

      return {
        success: false,
        error: codeMessages[err.code] || "Signup failed. Please try again.",
      };
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setIsExpired(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, isExpired, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("Wrap inside AuthProvider");
  return ctx;
};
