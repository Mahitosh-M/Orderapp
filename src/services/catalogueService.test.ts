import { describe, expect, it } from 'vitest'
import { isRemoteVersionNewer } from './catalogueService'
import type { CataloguePayload } from '../types/product'

const cached: CataloguePayload = { version: 2, publishedAt: '', productCount: 0, availableProductCount: 0, products: [], companies: [], categories: [], compositions: [] }

describe('catalogue version comparison', () => {
  it('fetches full catalogue only when remote is newer or cache is missing', () => {
    expect(isRemoteVersionNewer({ version: 3, publishedAt: '' }, cached)).toBe(true)
    expect(isRemoteVersionNewer({ version: 2, publishedAt: '' }, cached)).toBe(false)
    expect(isRemoteVersionNewer({ version: 1, publishedAt: '' }, null)).toBe(true)
  })
})
