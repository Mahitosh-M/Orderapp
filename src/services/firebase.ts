import { readFirebaseConfig } from '../publicFirebaseConfig';
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { initializeApp, type FirebaseApp } from 'firebase/app'

// Firebase browser configuration is intended to be public client configuration.
// Security is enforced by Firebase Auth and Firestore Rules, not by hiding this key.
const firebaseConfig = readFirebaseConfig(import.meta.env?.VITE_FIREBASE_CONFIG, 'VITE_FIREBASE_CONFIG')

const app: FirebaseApp = initializeApp(firebaseConfig)
const auth: Auth = getAuth(app)
const db: Firestore = getFirestore(app)

export const missingFirebaseVars: string[] = []

export function isFirebaseConfigured() {
  return true
}

export function getFirebaseServices() {
  return { app, auth, db }
}
