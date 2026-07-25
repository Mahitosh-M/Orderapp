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
  const hasFilters = Boolean(query.company || query.category || query.composition || query.availableOnly || query.sort !== 'name-asc')

  return (
    <section className="filters" aria-label="Product filters">
      <label className="search-field">
        <Search size={18} />
        <span className="sr-only">Search products</span>
        <input value={query.search} placeholder="Search medicine, composition, company" onChange={(event) => update({ search: event.target.value })} />
      </label>
      <details className="advanced-filters">
        <summary><Filter size={16} /> Filters {hasFilters ? 'active' : ''}</summary>
        <div className="filter-grid">
          <label><span>Company</span><select value={query.company} onChange={(event) => update({ company: event.target.value })}><option value="">All</option>{catalogue.companies.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span>Category</span><select value={query.category} onChange={(event) => update({ category: event.target.value })}><option value="">All</option>{catalogue.categories.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span>Composition</span><select value={query.composition} onChange={(event) => update({ composition: event.target.value })}><option value="">All</option>{catalogue.compositions.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span>Sort</span><select value={query.sort} onChange={(event) => update({ sort: event.target.value as SortMode })}><option value="name-asc">Name A-Z</option><option value="name-desc">Name Z-A</option><option value="company-asc">Company A-Z</option><option value="mrp-asc">MRP low-high</option><option value="mrp-desc">MRP high-low</option></select></label>
          <label><span>Page size</span><select value={query.pageSize} onChange={(event) => update({ pageSize: Number(event.target.value) })}>{PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size}</option>)}</select></label>
          <label className="checkbox-row"><input type="checkbox" checked={query.availableOnly} onChange={(event) => update({ availableOnly: event.target.checked })} /> Available only</label>
        </div>
        <button className="button secondary compact-button" onClick={() => setQuery({ search: '', company: '', category: '', composition: '', availableOnly: false, sort: 'name-asc', pageSize: 80 })}>
          <X size={16} />
          Clear filters
        </button>
      </details>
    </section>
  )
}
