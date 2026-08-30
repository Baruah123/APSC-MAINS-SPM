import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  // Initialize Firebase App Check BEFORE any other services
  if (typeof window !== "undefined") {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LdZk6AtAAAAABGvbkY1bV2ZrwyUv644c7ehi8c6";
    try {
      // Use self.FIREBASE_APPCHECK_DEBUG_TOKEN to allow localhost testing if needed
      initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(siteKey),
        isTokenAutoRefreshEnabled: true
      });
    } catch (error) {
      console.error("App Check initialization error:", error);
    }
  }
} else {
  app = getApp();
}

const auth = getAuth(app);

export { auth, app };
