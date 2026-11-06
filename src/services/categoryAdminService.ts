import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth, getIdTokenResult, signOut } from 'firebase/auth'
import { collection, deleteDoc, doc, getDoc, getDocs, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore'
import { readFirebaseConfig } from '../publicFirebaseConfig'
export function getCategoryAdminServices() {
  const options = readFirebaseConfig(import.meta.env.VITE_CISAPP_FIREBASE_CONFIG, 'VITE_CISAPP_FIREBASE_CONFIG')
  if (options.projectId !== 'cisapp-236ab') throw new Error('Category administration must use the CISapp project.')
  const name = 'cisapp-category-admin'
  const app = getApps().some(app => app.name === name) ? getApp(name) : initializeApp(options, name)
  return { auth: getAuth(app), db: getFirestore(app) }
}
export function categoryImageId(category: string) {
  const key = category.trim().toLowerCase()
  if (!key || key.length > 160 || key === '.' || key === '..') throw new Error('Select a valid category.')
  return encodeURIComponent(key)
}
function productImageId(id: string) {
  if (!id || id.length > 160 || id === '.' || id === '..') throw new Error('Select a valid product.')
  return encodeURIComponent(id)
}
export function validManagedImage(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 240000 && new RegExp('^data:image/(jpeg|webp);base64,[A-Za-z0-9+/=]+$').test(value)
}
export async function requireCategoryAdmin() {
  const { auth, db } = getCategoryAdminServices()
  const user = auth.currentUser
  if (!user) throw new Error('Open Orderapp from CISapp Admin.')
  const token = await getIdTokenResult(user)
  const profile = await getDoc(doc(db, 'users', user.uid))
  if (token.claims.orderappAdmin !== true || !profile.exists() || !['Admin', 'admin'].includes(profile.data().role) || profile.data().active !== true) {
    await signOut(auth)
    throw new Error('Only an active CISapp Admin can manage images.')
  }
}
export async function loadManagedCategoryImages(): Promise<Record<string, string[]>> {
  const snapshot = await getDocs(collection(getCategoryAdminServices().db, 'orderCategoryImages'))
  const result: Record<string, string[]> = Object.create(null)
  snapshot.forEach(row => {
    const data = row.data()
    if (typeof data.category === 'string' && validManagedImage(data.imageUrl)) result[data.category.trim().toLowerCase()] = [data.imageUrl]
  })
  return result
}
export async function saveCategoryImage(category: string, imageUrl: string) {
  await requireCategoryAdmin()
  if (!validManagedImage(imageUrl) || !imageUrl.startsWith('data:image/jpeg;')) throw new Error('Choose a smaller image.')
  await setDoc(doc(getCategoryAdminServices().db, 'orderCategoryImages', categoryImageId(category)), {
    category: category.trim(), imageUrl, width: 512, height: 512, updatedAt: serverTimestamp(),
  })
}
export async function resetCategoryImage(category: string) {
  await requireCategoryAdmin()
  await deleteDoc(doc(getCategoryAdminServices().db, 'orderCategoryImages', categoryImageId(category)))
}
export async function loadSavedProductImage(id: string) {
  const row = await getDoc(doc(getCategoryAdminServices().db, 'orderProductImages', productImageId(id)))
  return row.exists() && validManagedImage(row.data().imageUrl) ? row.data().imageUrl as string : null
}
export async function saveProductImage(productId: string, name: string, imageUrl: string) {
  await requireCategoryAdmin()
  if (!validManagedImage(imageUrl) || !imageUrl.startsWith('data:image/webp;')) throw new Error('Choose a smaller image.')
  await setDoc(doc(getCategoryAdminServices().db, 'orderProductImages', productImageId(productId)), {
    productId, name: name.slice(0, 200), imageUrl, width: 512, height: 512, updatedAt: serverTimestamp(),
  })
}
export async function resetProductImage(id: string) {
  await requireCategoryAdmin()
  await deleteDoc(doc(getCategoryAdminServices().db, 'orderProductImages', productImageId(id)))
}
export async function logoutCategoryAdmin() { await signOut(getCategoryAdminServices().auth) }
