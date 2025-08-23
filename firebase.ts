import { initializeApp } from "firebase/app";
import { getFirestore, collection } from "firebase/firestore";

// =================================================================================
// IMPORTANT: ACTION REQUIRED
// =================================================================================
// Paste your Firebase configuration object below to connect the app.
// You can find this in your Firebase project settings.
//
// 1. Go to Firebase Console: https://console.firebase.google.com/
// 2. Select your project.
// 3. Go to Project Settings (⚙️ icon) > General tab.
// 4. In the "Your apps" section, find your web app.
// 5. Under "SDK setup and configuration", copy the `firebaseConfig` object.
// 6. Replace the entire `firebaseConfig` object below with the one you copied.
// =================================================================================

const firebaseConfig = {
  // PASTE YOUR FIREBASE CONFIG OBJECT HERE
  apiKey: "AIzaSyBDex1qV7RryDY8SpMA1Wc9PEQ_4Ce9vNU",
  authDomain: "fiery-surf-466804-n3.firebaseapp.com",
  projectId: "fiery-surf-466804-n3",
  storageBucket: "fiery-surf-466804-n3.firebasestorage.app",
  messagingSenderId: "203861426121",
  appId: "1:203861426121:web:4bc8a7634081d91f9af218",
  measurementId: "G-K4ZQKKG96C"
};

// =================================================================================

// A simple check to see if the config is still a placeholder.
export const isFirebaseConfigured =
  firebaseConfig.projectId !== "YOUR_PROJECT_ID" &&
  firebaseConfig.apiKey !== "YOUR_API_KEY";

if (!isFirebaseConfigured) {
  // This will appear in the browser console to remind you to update the config.
  console.error(
    "Firebase config is not set. The app is running in local-only mode. Please update firebase.ts with your project's configuration to enable cloud features."
  );
}

// Initialize Firebase and Firestore only if configured
const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
const db = app ? getFirestore(app) : null;

// Reference to the 'bookings' collection.
export const bookingsCollectionRef = db ? collection(db, "bookings") : null;
