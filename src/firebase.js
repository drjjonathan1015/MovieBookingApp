// firebase.js - UPDATED WITH MODERN PERSISTENCE API (No More Warnings!)
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

// IMPORTANT: Move these to .env file in production
// Create a .env file with:
// VITE_FIREBASE_API_KEY=your_api_key
// VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
// etc...

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD_C-veCBbukElivTU6vVd025lO-v6MZfk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "moviebookingapp-c495c.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "moviebookingapp-c495c",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "moviebookingapp-c495c.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "721047791249",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:721047791249:web:692765bc020e0214f00130",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-0QGZKVLBLT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const storage = getStorage(app);

// ✅ NEW WAY: Initialize Firestore with modern cache settings (No deprecation warning!)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

// Note: The new API automatically handles:
// - Multiple tabs (no more 'failed-precondition' errors)
// - Browser compatibility (graceful fallback)
// - Offline persistence (enabled by default with persistentLocalCache)

export default app;

/* 
WHAT CHANGED:
❌ OLD (Deprecated):
  import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
  const db = getFirestore(app);
  enableIndexedDbPersistence(db); // This caused the warning

✅ NEW (Modern):
  import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
  const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });

BENEFITS:
✓ No deprecation warnings
✓ Better multi-tab support
✓ Automatic error handling
✓ Same functionality as before
✓ Future-proof (recommended by Firebase team)
*/