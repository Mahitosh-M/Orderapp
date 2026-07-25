import { doc, getDoc } from 'firebase/firestore'
import { signInWithEmailAndPassword, signOut, type User } from 'firebase/auth'
import type { CustomerProfile } from '../types/customer'
import { getFirebaseServices } from './firebase'

export async function loginWithEmail(email: string, password: string) {
  const { auth } = getFirebaseServices()
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return credential.user
}

export async function logoutFirebase() {
  const { auth } = getFirebaseServices()
  await signOut(auth)
}

export async function loadCustomerProfile(user: User) {
  const { db } = getFirebaseServices()
  const snapshot = await getDoc(doc(db, 'customers', user.uid))
  if (!snapshot.exists()) throw new Error('Your customer profile was not found. Contact the supplier.')
  const customer = snapshot.data() as CustomerProfile
  if (!customer.active) throw new Error('This account is disabled. Contact the supplier.')
  if (customer.role !== 'customer' && customer.role !== 'staff') {
    throw new Error('This account has an invalid role. Contact the supplier.')
  }
  return customer
}
