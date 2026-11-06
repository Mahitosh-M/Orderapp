import { doc, getDoc } from 'firebase/firestore'
import { getCategoryAdminServices, validManagedImage } from './categoryAdminService'
const cache = new Map<string, Promise<string | null>>()
export function loadProductImage(id: string): Promise<string | null> {
  if (!cache.has(id)) cache.set(id, (async () => {
    const row = await getDoc(doc(getCategoryAdminServices().db, 'orderProductImages', encodeURIComponent(id)))
    return row.exists() && validManagedImage(row.data().imageUrl) ? row.data().imageUrl as string : null
  })().catch(() => { cache.delete(id); return null }))
  return cache.get(id)!
}
export function invalidateProductImage(id: string) {
  cache.delete(id)
  window.dispatchEvent(new CustomEvent('orderapp-product-image', { detail: id }))
}
