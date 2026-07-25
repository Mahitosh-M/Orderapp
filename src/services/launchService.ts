import { doc, getDoc } from 'firebase/firestore'
import type { CustomerProfile } from '../types/customer'
import { getFirebaseServices } from './firebase'

export async function loadLaunchProfile(uid: string, customerId?: string) {
  const { db } = getFirebaseServices()
  const snapshot = await getDoc(doc(db, 'customers', uid))

  if (!snapshot.exists()) {
    throw new Error('Customer profile was not found.')
  }

  const profile = snapshot.data() as CustomerProfile

  if (!profile.active) {
    throw new Error('This customer profile is disabled.')
  }

  if (profile.role !== 'customer' && profile.role !== 'staff') {
    throw new Error('This customer profile has an invalid role.')
  }

  if (customerId && profile.customerCode !== customerId && profile.uid !== customerId) {
    throw new Error('Customer ID does not match the profile.')
  }

  return profile
}
