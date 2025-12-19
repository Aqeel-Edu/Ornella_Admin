import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Use environment variables when available. Ensure NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is set
// to the correct bucket name (usually <project-id>.appspot.com). If the env var is wrong
// we fall back to the commonly used appspot bucket name.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyALwOC0Bk2xUfoTJpGTi-8knQArE1GPdo8",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "ornella-f303f.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "ornella-f303f",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "ornella-f303f.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "659357488733",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:659357488733:web:14daadb13897de75289fb4",
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const storage = getStorage(app)
