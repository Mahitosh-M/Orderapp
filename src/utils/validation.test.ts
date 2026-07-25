import { describe, expect, it } from 'vitest'
import { hasForbiddenSellingFields, validateCatalogue, validateProduct } from './validation'

describe('catalogue validation', () => {
  it('rejects forbidden selling/internal fields', () => {
    expect(validateProduct({ id: 'P1', name: 'A', composition: 'C', company: 'Co', category: 'Cat', packing: 'Pack', mrp: 1, imageUrl: '', available: true, sellingPrice: 5 })).toBe(false)
    expect(hasForbiddenSellingFields({ margin: 10 })).toBe(true)
  })

  it('validates catalogue payload shape', () => {
    expect(() => validateCatalogue({ version: 1, publishedAt: 'now', productCount: 0, availableProductCount: 0, products: [], companies: [], categories: [], compositions: [] })).not.toThrow()
    expect(() => validateCatalogue({ version: '1', products: [] })).toThrow()
  })
})
