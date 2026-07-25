import { useMemo, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { ErrorState } from '../components/common/ErrorState'
import { LoadingState } from '../components/common/LoadingState'
import { ProductFilters } from '../components/catalogue/ProductFilters'
import { ProductList } from '../components/catalogue/ProductList'
import { useCatalogue } from '../hooks/useCatalogue'
import { useDebounce } from '../hooks/useDebounce'
import { filterAndSortProducts } from '../utils/search'
import { formatDate } from '../utils/formatting'
import type { ProductQuery } from '../types/catalogue'

const defaultQuery: ProductQuery = { search: '', company: '', category: '', composition: '', availableOnly: false, sort: 'name-asc', pageSize: 20 }

export function Catalogue() {
  const { catalogue, loading, error, fromCache, offline, refreshing, refresh } = useCatalogue()
  const [query, setQuery] = useState(defaultQuery)
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounce(query.search)
  const effectiveQuery = { ...query, search: debouncedSearch }
  const products = useMemo(() => (catalogue ? filterAndSortProducts(catalogue.products, effectiveQuery) : []), [catalogue, effectiveQuery])
  const visible = products.slice(0, page * query.pageSize)
  if (loading) return <LoadingState label="Loading catalogue" />
  if (!catalogue) return <ErrorState message={error ?? 'Catalogue unavailable.'} />
  return (
    <section className="page-stack">
      <div className="page-title-row">
        <div>
          <h1>Catalogue</h1>
          <p>{products.length} results · Version {catalogue.version} · Updated {formatDate(catalogue.publishedAt)} {fromCache ? '· Cached' : ''}</p>
        </div>
        <button className="button secondary" disabled={refreshing} onClick={() => void refresh()}><RefreshCw size={17} />Refresh</button>
      </div>
      {offline && <ErrorState message="You are offline. Cached catalogue remains available." />}
      {error && <ErrorState message={error} />}
      <ProductFilters catalogue={catalogue} query={query} setQuery={(next) => { setQuery(next); setPage(1) }} />
      <ProductList products={visible} />
      {visible.length < products.length && <button className="button secondary wide" onClick={() => setPage((value) => value + 1)}>Load more</button>}
    </section>
  )
}
