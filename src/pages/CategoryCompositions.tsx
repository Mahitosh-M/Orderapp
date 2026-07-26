import { ArrowRight, PackageSearch } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { EmptyState } from '../components/common/EmptyState'
import { ErrorState } from '../components/common/ErrorState'
import { LoadingState } from '../components/common/LoadingState'
import { useCatalogue } from '../hooks/useCatalogue'

const formImages = {
  tablet: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=240&q=70',
  capsule: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=240&q=70',
  syrup: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=240&q=70',
  suspension: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=240&q=70',
  injection: 'https://images.unsplash.com/photo-1612277795421-9bc7706a4a34?auto=format&fit=crop&w=240&q=70',
  syringe: 'https://images.unsplash.com/photo-1612277795421-9bc7706a4a34?auto=format&fit=crop&w=240&q=70',
  needle: 'https://images.unsplash.com/photo-1612277795421-9bc7706a4a34?auto=format&fit=crop&w=240&q=70',
}

function compositionImageFor(text: string) {
  const normalized = text.toLowerCase()
  if (normalized.includes('cap')) return formImages.capsule
  if (normalized.includes('susp')) return formImages.suspension
  if (normalized.includes('syp') || normalized.includes('syrup')) return formImages.syrup
  if (normalized.includes('inj')) return formImages.injection
  if (normalized.includes('needle')) return formImages.needle
  if (normalized.includes('syringe')) return formImages.syringe
  return formImages.tablet
}

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
        imageUrl: compositionImageFor(`${composition} ${matchingProducts.map((product) => `${product.name} ${product.packing}`).join(' ')}`),
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
            <span className="category-icon composition-icon"><img src={row.imageUrl} alt="" loading="lazy" /></span>
            <span className="category-copy">
              <span className="category-card-head">
                <strong>{row.composition}</strong>
                <small>{row.available}/{row.count}</small>
              </span>
            </span>
            <span className="category-go" aria-hidden="true"><PackageSearch size={14} /><ArrowRight size={14} /></span>
          </Link>
        ))}
      </div>
    </section>
  )
}
