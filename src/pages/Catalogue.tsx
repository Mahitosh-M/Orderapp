import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ErrorState } from '../components/common/ErrorState'
import { LoadingState } from '../components/common/LoadingState'
import { ProductFilters } from '../components/catalogue/ProductFilters'
import { ProductList } from '../components/catalogue/ProductList'
import { useCatalogue } from '../hooks/useCatalogue'
import { useDebounce } from '../hooks/useDebounce'
import { filterAndSortProducts } from '../utils/search'
import type { ProductQuery } from '../types/catalogue'
import { CategoryCards } from './Categories'

const defaultQuery: ProductQuery = { search: '', company: '', category: '', composition: '', availableOnly: false, sort: 'name-asc', pageSize: 80 }

export function Catalogue() {
  const { catalogue, loading, error, offline } = useCatalogue()
  const [searchParams] = useSearchParams()
  const selectedCategory = searchParams.get('category') ?? ''
  const selectedComposition = searchParams.get('composition') ?? ''
  const [query, setQuery] = useState(defaultQuery)
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounce(query.search)
  const hasSearch = Boolean(debouncedSearch.trim())
  const routeQuery = {
    category: hasSearch ? query.category : query.category || selectedCategory,
    composition: hasSearch ? query.composition : query.composition || selectedComposition,
  }
  const effectiveQuery = { ...query, ...routeQuery, search: debouncedSearch }
  const products = useMemo(() => (catalogue ? filterAndSortProducts(catalogue.products, effectiveQuery) : []), [catalogue, effectiveQuery])
  const hasRouteQuery = Boolean(selectedCategory || selectedComposition)
  const isRouteProductPage = hasRouteQuery && !hasSearch && !query.category && !query.composition && !query.company && !query.availableOnly
  const hasProductQuery = Boolean(hasSearch || hasRouteQuery || query.category || query.composition || query.company || query.availableOnly)
  const visible = products.slice(0, page * query.pageSize)
  useEffect(() => {
    setPage(1)
  }, [selectedCategory, selectedComposition])
  if (loading) return <LoadingState label="Loading catalogue" />
  if (!catalogue) return <ErrorState message={error ?? 'Catalogue unavailable.'} />
  return (
    <section className="page-stack">
      {!isRouteProductPage && (
        <div className="page-title-row catalogue-title-row">
          <div>
            <h1>Catalogue</h1>
          </div>
        </div>
      )}
      {offline && <ErrorState message="You are offline. Cached catalogue remains available." />}
      {error && <ErrorState message={error} />}
      {!isRouteProductPage && <ProductFilters catalogue={catalogue} query={query} setQuery={(next) => { setQuery(next); setPage(1) }} />}
      {hasProductQuery ? (
        <>
          <ProductList products={visible} relatedSearchTerm={debouncedSearch} />
          {visible.length < products.length && <button className="button secondary wide" onClick={() => setPage((value) => value + 1)}>Load more</button>}
        </>
      ) : null}
      {!hasProductQuery && (
        <section className="catalogue-categories-section">
          <div className="page-title-row catalogue-title-row">
            <div>
              <h2>Categories</h2>
              <p>Open a category to choose compositions.</p>
            </div>
          </div>
          <CategoryCards catalogue={catalogue} />
        </section>
      )}
    </section>
  )
}
