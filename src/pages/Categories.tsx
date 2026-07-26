import { ArrowRight, Boxes, Layers3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../components/common/EmptyState'
import { ErrorState } from '../components/common/ErrorState'
import { LoadingState } from '../components/common/LoadingState'
import { useCatalogue } from '../hooks/useCatalogue'
import type { CataloguePayload } from '../types/product'

const categoryImages: Record<string, string> = {
  antibiotics: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=80',
  fever: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=900&q=80',
}

const fallbackCategoryImage = 'https://images.unsplash.com/photo-1576671081837-49000212a370?auto=format&fit=crop&w=900&q=80'

function getCategoryImage(category: string) {
  return categoryImages[category.trim().toLowerCase()] ?? fallbackCategoryImage
}

export function CategoryCards({ catalogue }: { catalogue: CataloguePayload }) {
  const categoryRows = catalogue.categories
    .map((category) => {
      const products = catalogue.products.filter((product) => product.category === category)
      return {
        category,
        count: products.length,
        available: products.filter((product) => product.available).length,
        compositionCount: new Set(products.map((product) => product.composition).filter(Boolean)).size,
      }
    })
    .filter((row) => row.count > 0)
    .sort((left, right) => left.category.localeCompare(right.category))

  if (categoryRows.length === 0) return <EmptyState title="No categories" message="Catalogue categories will appear here." />

  return (
    <div className="category-card-grid">
      {categoryRows.map((row) => (
        <Link className="category-card" key={row.category} to={`/categories/${encodeURIComponent(row.category)}`}>
          <span className="category-image" style={{ backgroundImage: `url(${getCategoryImage(row.category)})` }} aria-hidden="true" />
          <span className="category-icon"><Boxes size={21} /></span>
          <span className="category-copy">
            <span className="category-card-head">
              <strong>{row.category}</strong>
              <small>{row.available}/{row.count}</small>
            </span>
            <span className="category-subline"><Layers3 size={12} />{row.compositionCount} compositions</span>
            <span className="category-hint">Tap to view composition cards</span>
          </span>
          <span className="category-go" aria-hidden="true"><ArrowRight size={15} /></span>
        </Link>
      ))}
    </div>
  )
}

export function Categories() {
  const { catalogue, loading, error, offline } = useCatalogue()

  if (loading) return <LoadingState label="Loading categories" />
  if (!catalogue) return <ErrorState message={error ?? 'Categories unavailable.'} />

  return (
    <section className="page-stack">
      <div className="page-title-row catalogue-title-row">
        <div>
          <h1>Categories</h1>
          <p>Browse products by medicine type.</p>
        </div>
      </div>
      {offline && <ErrorState message="You are offline. Cached categories remain available." />}
      {error && <ErrorState message={error} />}
      <CategoryCards catalogue={catalogue} />
    </section>
  )
}
