import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Initialize Firebase App Check
if (typeof window !== "undefined") {
  // Automatically enable Debug Token on localhost to bypass the 403 Error
  if (window.location.hostname === "localhost") {
    // @ts-ignore
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = "3b0457a3-30c8-4ef8-b240-47058ab2c6c5";
  }
  
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LdZk6AtAAAAABGvbkY1bV2ZrwyUv644c7ehi8c6";
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(siteKey),
      isTokenAutoRefreshEnabled: true
    });
  } catch (error) {
    console.error("App Check initialization error:", error);
  }
}

export { auth, app };
