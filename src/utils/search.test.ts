import { describe, expect, it } from 'vitest'
import { filterAndSortProducts, matchesProductSearch } from './search'
import type { Product } from '../types/product'

const products: Product[] = [
  { id: 'P1', name: 'Beta', composition: 'C2', company: 'Zen', category: 'Vitamin', packing: '10 tablets', mrp: 20, imageUrl: '', available: true },
  { id: 'P2', name: 'Alpha', composition: 'C1', company: 'Apex', category: 'Antacid', packing: '20 tablets', mrp: 10, imageUrl: '', available: false },
]

describe('catalogue search and filters', () => {
  it('searches expected public product fields', () => {
    expect(matchesProductSearch(products[0], 'vitamin')).toBe(true)
    expect(matchesProductSearch(products[0], 'supplier')).toBe(false)
  })

  it('filters unavailable products and sorts by mrp', () => {
    const result = filterAndSortProducts(products, { search: '', company: '', category: '', composition: '', availableOnly: true, sort: 'mrp-desc', pageSize: 20 })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('P1')
  })
})
