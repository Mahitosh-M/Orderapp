import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { CartProvider } from './CartContext'
import { useCart } from '../hooks/useCart'
import type { Product } from '../types/product'

vi.mock('../hooks/useLaunch', () => ({ useLaunch: () => ({ uid: 'test-user' }) }))
vi.mock('../services/cacheService', () => ({
  getCart: vi.fn(async () => []),
  saveCart: vi.fn(async () => undefined),
  clearCart: vi.fn(async () => undefined),
}))

const product: Product = { id: 'P1', name: 'Test Product', composition: 'Test', company: 'Co', category: 'Cat', packing: '10 tabs', mrp: 10, imageUrl: '', available: true }
const unavailable: Product = { ...product, id: 'P2', available: false }

function wrapper({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>
}

describe('cart context', () => {
  it('adds, updates and removes cart items', async () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    await waitFor(() => expect(result.current.items).toEqual([]))
    act(() => result.current.addProduct(product, 2))
    expect(result.current.totalQuantity).toBe(2)
    act(() => result.current.updateQuantity('P1', 4))
    expect(result.current.items[0].quantity).toBe(4)
    act(() => result.current.removeItem('P1'))
    expect(result.current.items).toHaveLength(0)
  })

  it('protects unavailable products from being added', async () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    await waitFor(() => expect(result.current.items).toEqual([]))
    act(() => result.current.addProduct(unavailable, 1))
    expect(result.current.items).toHaveLength(0)
  })
})
