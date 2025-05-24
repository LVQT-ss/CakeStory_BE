// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "reactchat-be688.firebaseapp.com",
  projectId: "reactchat-be688",
  storageBucket: "reactchat-be688.firebasestorage.app",
  messagingSenderId: "1080867005274",
  appId: "1:1080867005274:web:b2c32b102a178ae4c74963"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


export const auth = getAuth()
export const db = getFirestore()
export const storage = getStorage()