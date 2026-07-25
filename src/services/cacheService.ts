import { openDB } from 'idb'
import type { CataloguePayload } from '../types/product'
import type { CartItem } from '../types/order'

const DB_NAME = 'partner-order-cache'
const DB_VERSION = 1

async function getDatabase() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('catalogue')) db.createObjectStore('catalogue')
      if (!db.objectStoreNames.contains('metadata')) db.createObjectStore('metadata')
      if (!db.objectStoreNames.contains('cart')) db.createObjectStore('cart')
    },
  })
}

export async function getCachedCatalogue() {
  const db = await getDatabase()
  return (await db.get('catalogue', 'current')) as CataloguePayload | undefined
}

export async function saveCachedCatalogue(catalogue: CataloguePayload) {
  const db = await getDatabase()
  await db.put('catalogue', catalogue, 'current')
  await db.put('metadata', new Date().toISOString(), 'catalogueSavedAt')
}

export async function getCart(uid: string) {
  const db = await getDatabase()
  return ((await db.get('cart', uid)) as CartItem[] | undefined) ?? []
}

export async function saveCart(uid: string, items: CartItem[]) {
  const db = await getDatabase()
  await db.put('cart', items, uid)
}

export async function clearCart(uid: string) {
  const db = await getDatabase()
  await db.delete('cart', uid)
}
