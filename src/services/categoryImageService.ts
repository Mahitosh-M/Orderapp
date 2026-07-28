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

export async function loadCategoryImages() {
  const { db } = getFirebaseServices()
  const snapshot = await getDocs(collection(db, 'categoryImages'))
  const images: CategoryImageMap = {}

  snapshot.forEach((doc) => {
    const data = doc.data() as Partial<CategoryImageRecord>
    if (!data.category || !data.imageUrl || data.active === false) return
    images[categoryKey(data.category)] = [data.imageUrl]
  })

  return images
}
