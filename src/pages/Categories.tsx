import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../components/common/EmptyState'
import { ErrorState } from '../components/common/ErrorState'
import { LoadingState } from '../components/common/LoadingState'
import { useCatalogue } from '../hooks/useCatalogue'
import { loadCategoryImages, type CategoryImageMap } from '../services/categoryImageService'
import type { CataloguePayload } from '../types/product'

const categoryImages: Record<string, string[]> = {
  'allergy & cough & cold': ['/category-images/allergy-cough-cold.jpg'],
  antibiotics: ['/category-images/antibiotics-category.jpg'],
  'antifungal & skin': ['/category-images/antifungal-skin.jpg'],
  'antispectics & disinfectants': ['/category-images/antiseptics-disinfectants.jpg'],
  'e/e drops': ['/category-images/eye-ear-drops.jpg'],
  gastrointestinal: ['/category-images/gastrointestinal.jpg'],
  'health suppliments': ['/category-images/health-suppliments.jpg'],
  'heart + bp + sugar': ['/category-images/heart-bp-sugar.jpg'],
  'iv fluids': ['/category-images/iv-fluids.jpg'],
  'painkillers & fever': ['/category-images/painkillers-fever.jpg'],
  respules: ['/category-images/respules.jpg'],
  'steroids / hormone': ['/category-images/steroids-hormone.jpg'],
  surgicals: ['/category-images/surgicals.jpg'],
}

const fallbackCategoryImages = ['/category-images/antibiotics-category.jpg']

function getCategoryImages(category: string, remoteImages: CategoryImageMap) {
  const key = category.trim().toLowerCase()
  return remoteImages[key] ?? categoryImages[key] ?? fallbackCategoryImages
}

export function CategoryCards({ catalogue }: { catalogue: CataloguePayload }) {
  const [remoteImages, setRemoteImages] = useState<CategoryImageMap>({})

  useEffect(() => {
    let ignore = false
    loadCategoryImages()
      .then((images) => {
        if (!ignore) setRemoteImages(images)
      })
      .catch(() => {
        if (!ignore) setRemoteImages({})
      })
    return () => {
      ignore = true
    }
  }, [])

  const categoryRows = catalogue.categories
    .map((category) => {
      const products = catalogue.products.filter((product) => product.category === category)
      return {
        category,
        count: products.length,
      }
    })
    .filter((row) => row.count > 0)
    .sort((left, right) => left.category.localeCompare(right.category))

  if (categoryRows.length === 0) return <EmptyState title="No categories" message="Catalogue categories will appear here." />

  return (
    <div className="category-card-grid">
      {categoryRows.map((row) => (
        <Link className="category-card" key={row.category} to={`/categories/${encodeURIComponent(row.category)}`}>
          <span className="category-images" aria-hidden="true">
            {getCategoryImages(row.category, remoteImages).map((image) => (
              <span className="category-image-panel" key={image} style={{ backgroundImage: `url("${encodeURI(image)}")` }} />
            ))}
          </span>
          <span className="category-copy">
            <strong>{row.category}</strong>
          </span>
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
