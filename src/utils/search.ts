import type { Product } from '../types/product'
import type { ProductQuery } from '../types/catalogue'

export function matchesProductSearch(product: Product, rawSearch: string) {
  const search = rawSearch.trim().toLowerCase()
  if (!search) return true
  return [
    product.id,
    product.name,
    product.composition,
    product.company,
    product.category,
    product.packing,
  ].some((value) => value.toLowerCase().includes(search))
}

export function filterAndSortProducts(products: Product[], query: ProductQuery) {
  const filtered = products.filter((product) => {
    if (!matchesProductSearch(product, query.search)) return false
    if (query.company && product.company !== query.company) return false
    if (query.category && product.category !== query.category) return false
    if (query.composition && product.composition !== query.composition) return false
    if (query.availableOnly && !product.available) return false
    return true
  })

  return filtered.sort((a, b) => {
    if (query.sort === 'name-desc') return b.name.localeCompare(a.name)
    if (query.sort === 'company-asc') return a.company.localeCompare(b.company) || a.name.localeCompare(b.name)
    if (query.sort === 'mrp-asc') return a.mrp - b.mrp
    if (query.sort === 'mrp-desc') return b.mrp - a.mrp
    return a.name.localeCompare(b.name)
  })
}
