import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { initializeApp, type FirebaseApp } from 'firebase/app'

// Firebase browser configuration is intended to be public client configuration.
// Security is enforced by Firebase Auth and Firestore Rules, not by hiding this key.
const firebaseConfig = {
  apiKey: 'AIzaSyDBlyonBZ7x9uhMnGjT_mjNlTWctZ0PPZ4',
  authDomain: 'orderapp-35200.firebaseapp.com',
  projectId: 'orderapp-35200',
  storageBucket: 'orderapp-35200.firebasestorage.app',
  messagingSenderId: '722911156214',
  appId: '1:722911156214:web:1198a7044d6c086db799d7',
}

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
