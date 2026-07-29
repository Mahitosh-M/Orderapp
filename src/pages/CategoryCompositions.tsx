import { Link, useParams } from 'react-router-dom'
import { EmptyState } from '../components/common/EmptyState'
import { ErrorState } from '../components/common/ErrorState'
import { LoadingState } from '../components/common/LoadingState'
import { useCatalogue } from '../hooks/useCatalogue'

export function CategoryCompositions() {
  const { category = '' } = useParams()
  const decodedCategory = decodeURIComponent(category)
  const { catalogue, loading, error, offline } = useCatalogue()

  if (loading) return <LoadingState label="Loading compositions" />
  if (!catalogue) return <ErrorState message={error ?? 'Compositions unavailable.'} />

  const products = catalogue.products.filter((product) => product.category === decodedCategory)
  const compositionRows = [...new Set(products.map((product) => product.composition).filter(Boolean))]
    .map((composition) => {
      const matchingProducts = products.filter((product) => product.composition === composition)
      return {
        composition,
        count: matchingProducts.length,
        available: matchingProducts.filter((product) => product.available).length,
      }
    })
    .sort((left, right) => left.composition.localeCompare(right.composition))

  if (compositionRows.length === 0) return <EmptyState title="No compositions" message="No compositions were found for this category." />

  return (
    <section className="page-stack">
      <Link className="text-link" to="/categories">Back to categories</Link>
      <div className="page-title-row catalogue-title-row">
        <div>
          <h1>{decodedCategory}</h1>
          <p>Select a composition to view matching products.</p>
        </div>
      </div>
      {offline && <ErrorState message="You are offline. Cached compositions remain available." />}
      {error && <ErrorState message={error} />}
      <div className="category-card-grid">
        {compositionRows.map((row) => (
          <Link className="category-card composition-card" key={row.composition} to={`/catalogue?category=${encodeURIComponent(decodedCategory)}&composition=${encodeURIComponent(row.composition)}`}>
            <span className="category-copy">
              <strong>{row.composition}</strong>
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
