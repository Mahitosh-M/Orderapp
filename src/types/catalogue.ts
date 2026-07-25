export type SortMode = 'name-asc' | 'name-desc' | 'company-asc' | 'mrp-asc' | 'mrp-desc'

export interface ProductQuery {
  search: string
  company: string
  category: string
  composition: string
  availableOnly: boolean
  sort: SortMode
  pageSize: number
}
