// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCB9Wd3uSJUFj3QHUG4V7LYDQKqBpsSaIo",
  authDomain: "vanshavali-cf5c2.firebaseapp.com",
  projectId: "vanshavali-cf5c2",
  storageBucket: "vanshavali-cf5c2.firebasestorage.app",
  messagingSenderId: "702945198724",
  appId: "1:702945198724:web:820343e9fe2cc2694938d1",
  measurementId: "G-NXDGVKB9WK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
// Auth and Firestore can be initialized on both client and server
// Analytics should only be initialized in browser
export const auth = getAuth(app);
export const db = getFirestore(app);

let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { app, analytics };