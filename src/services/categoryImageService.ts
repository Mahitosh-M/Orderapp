import { collection, getDocs } from 'firebase/firestore'
import { getFirebaseServices } from './firebase'

export interface CategoryImageRecord {
  category: string
  imageUrl: string
  active?: boolean
}

export type CategoryImageMap = Record<string, string[]>

function categoryKey(category: string) {
  return category.trim().toLowerCase()
}

export function normalizeCategoryImageUrl(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim() || value.length > 4096) return null
  const source = value.trim()
  try {
    const url = new URL(source, 'https://orderapp-35200.web.app')
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return null
    // Use this site's precached asset, including when opened through another Hosting domain.
    if (['orderapp-35200.web.app', 'orderapp-35200.firebaseapp.com'].includes(url.hostname)
      && url.pathname.startsWith('/category-images/')) {
      return url.pathname + url.search
    }
    return url.href
  } catch {
    return null
  }
}

export async function loadCategoryImages() {
  const { db } = getFirebaseServices()
  const snapshot = await getDocs(collection(db, 'categoryImages'))
  const images: CategoryImageMap = {}

  snapshot.forEach((doc) => {
    const data = doc.data() as Partial<CategoryImageRecord>
    if (typeof data.category !== 'string' || !data.category.trim() || data.active === false) return
    const imageUrl = normalizeCategoryImageUrl(data.imageUrl)
    if (imageUrl) images[categoryKey(data.category)] = [imageUrl]
  })

  return images
}
