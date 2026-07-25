import { Filter, Search, X } from 'lucide-react'
import type { CataloguePayload } from '../../types/product'
import type { ProductQuery, SortMode } from '../../types/catalogue'
import { PAGE_SIZE_OPTIONS } from '../../utils/constants'

export function ProductFilters({
  catalogue,
  query,
  setQuery,
}: {
  catalogue: CataloguePayload
  query: ProductQuery
  setQuery: (query: ProductQuery) => void
}) {
  const update = (patch: Partial<ProductQuery>) => setQuery({ ...query, ...patch })
  return (
    <section className="filters" aria-label="Product filters">
      <label className="search-field">
        <Search size={18} />
        <span className="sr-only">Search products</span>
        <input value={query.search} placeholder="Search products, composition, company" onChange={(event) => update({ search: event.target.value })} />
      </label>
      <div className="filter-grid">
        <label><span>Company</span><select value={query.company} onChange={(event) => update({ company: event.target.value })}><option value="">All</option>{catalogue.companies.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span>Category</span><select value={query.category} onChange={(event) => update({ category: event.target.value })}><option value="">All</option>{catalogue.categories.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span>Composition</span><select value={query.composition} onChange={(event) => update({ composition: event.target.value })}><option value="">All</option>{catalogue.compositions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span>Sort</span><select value={query.sort} onChange={(event) => update({ sort: event.target.value as SortMode })}><option value="name-asc">Product name A-Z</option><option value="name-desc">Product name Z-A</option><option value="company-asc">Company A-Z</option><option value="mrp-asc">MRP low to high</option><option value="mrp-desc">MRP high to low</option></select></label>
        <label><span>Page size</span><select value={query.pageSize} onChange={(event) => update({ pageSize: Number(event.target.value) })}>{PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size}</option>)}</select></label>
        <label className="checkbox-row"><input type="checkbox" checked={query.availableOnly} onChange={(event) => update({ availableOnly: event.target.checked })} /> Available only</label>
      </div>
      <button className="button secondary" onClick={() => setQuery({ search: '', company: '', category: '', composition: '', availableOnly: false, sort: 'name-asc', pageSize: 20 })}>
        <X size={17} />
        Clear filters
      </button>
      <span className="filter-label"><Filter size={16} /> Filters active</span>
    </section>
  )
}
