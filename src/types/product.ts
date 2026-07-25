export interface Product {
  id: string
  name: string
  composition: string
  company: string
  category: string
  packing: string
  mrp: number
  imageUrl: string
  available: boolean
}

export interface CataloguePayload {
  version: number
  publishedAt: string
  productCount: number
  availableProductCount: number
  products: Product[]
  companies: string[]
  categories: string[]
  compositions: string[]
}

export interface CatalogueVersion {
  version: number
  publishedAt: string
}
