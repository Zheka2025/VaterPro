import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  projectId: "shopadminpro-6prg5",
  appId: "1:916694423724:web:ef84d7dcd0d5995a6c6709",
  storageBucket: "shopadminpro-6prg5.firebasestorage.app",
  apiKey: "AIzaSyBLBmZeRnK2InmICp0-Jzo1JsN6QL-OksI",
  authDomain: "shopadminpro-6prg5.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "916694423724"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
