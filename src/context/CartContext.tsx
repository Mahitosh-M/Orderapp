import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Product } from '../types/product'
import type { CartItem } from '../types/order'
import { clearCart as clearCachedCart, getCart, saveCart } from '../services/cacheService'
import { MAX_CART_QUANTITY } from '../utils/constants'

interface CartContextValue {
  items: CartItem[]
  totalProducts: number
  totalQuantity: number
  addProduct: (product: Product, quantity: number) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  clearCart: () => void
}

export const CartContext = createContext<CartContextValue | undefined>(undefined)

const guestKey = 'guest'

export function CartProvider({ children }: { children: ReactNode }) {
  const uid = guestKey
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    void getCart(uid).then(setItems)
  }, [uid])

  useEffect(() => {
    void saveCart(uid, items)
  }, [uid, items])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    const safeQuantity = Math.max(1, Math.min(MAX_CART_QUANTITY, Math.floor(quantity || 1)))
    setItems((current) => current.map((item) => (item.productId === productId ? { ...item, quantity: safeQuantity } : item)))
  }, [])

  const addProduct = useCallback((product: Product, quantity: number) => {
    if (!product.available) return
    const safeQuantity = Math.max(1, Math.min(MAX_CART_QUANTITY, Math.floor(quantity || 1)))
    setItems((current) => {
      const existing = current.find((item) => item.productId === product.id)
      if (existing) {
        return current.map((item) =>
          item.productId === product.id ? { ...item, quantity: Math.min(MAX_CART_QUANTITY, item.quantity + safeQuantity) } : item,
        )
      }
      return [
        ...current,
        {
          productId: product.id,
          productName: product.name,
          composition: product.composition,
          company: product.company,
          category: product.category,
          packing: product.packing,
          mrp: product.mrp,
          imageUrl: product.imageUrl,
          quantity: safeQuantity,
        },
      ]
    })
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems((current) => current.filter((item) => item.productId !== productId))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    void clearCachedCart(uid)
  }, [uid])

  const value = useMemo(
    () => ({
      items,
      totalProducts: items.length,
      totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
      addProduct,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [items, addProduct, updateQuantity, removeItem, clearCart],
  )
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
