import { Search, ShoppingBag, Sparkles, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CoverflowCarousel, type CoverflowSlide } from '../components/ui/coverflow-carousel'
import { ErrorState } from '../components/common/ErrorState'
import { LoadingState } from '../components/common/LoadingState'
import { ProductList } from '../components/catalogue/ProductList'
import { useCatalogue } from '../hooks/useCatalogue'
import { filterAndSortProducts } from '../utils/search'

const categoryArtwork: Record<string, string> = {
  'allergy & cough & cold': '/category-images/allergy-cough-cold.jpg', antibiotics: '/category-images/antibiotics-category.jpg',
  'antifungal & skin': '/category-images/antifungal-skin.jpg', 'antispectics & disinfectants': '/category-images/antiseptics-disinfectants.jpg',
  'e/e drops': '/category-images/eye-ear-drops.jpg', gastrointestinal: '/category-images/gastrointestinal.jpg',
  'health suppliments': '/category-images/health-suppliments.jpg', 'heart + bp + sugar': '/category-images/heart-bp-sugar.jpg',
  'iv fluids': '/category-images/iv-fluids.jpg', 'painkillers & fever': '/category-images/painkillers-fever.jpg',
  respules: '/category-images/respules.jpg', 'steroids / hormone': '/category-images/steroids-hormone.jpg', surgicals: '/category-images/surgicals.jpg',
}

type HomeSlide = CoverflowSlide & { category?: string }

export function Home() {
  const { catalogue, loading, error, offline } = useCatalogue()
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const slides = useMemo<HomeSlide[]>(() => {
    return catalogue?.categories.map((category) => {
      const count = catalogue.products.filter((product) => product.category === category).length
      return { category, src: categoryArtwork[category.trim().toLowerCase()] ?? '/category-images/antibiotics-category.jpg', alt: `${category} medicines`, title: category, subtitle: `${count} products available` }
    }).filter((slide) => !slide.subtitle.startsWith('0 ')) ?? []
  }, [catalogue])
  const matchingProducts = useMemo(() => {
    const value = search.trim()
    if (!catalogue || !value) return []
    return filterAndSortProducts(catalogue.products, {
      search: value, company: '', category: '', composition: '', availableOnly: false, sort: 'name-asc', pageSize: 80,
    })
  }, [catalogue, search])

  if (loading) return <LoadingState label="Preparing your home page" />
  if (!catalogue) return <ErrorState message={error ?? 'Catalogue unavailable.'} />

  return <section className="order-home page-stack">
    <div className="home-hero">
      <span className="home-kicker"><Sparkles size={14} /> QUICK & SIMPLE ORDERING</span>
      <h1>What do you need today?</h1>
      <p>Browse trusted products by category or search the complete catalogue.</p>
      <form className="home-search-form" onSubmit={(event) => event.preventDefault()}>
        <label className="home-search-field search-field">
          <Search size={19} aria-hidden="true" />
          <span className="sr-only">Search medicines and products</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search medicines and products" />
          {search && <button type="button" className="home-search-clear" aria-label="Clear search" onClick={() => setSearch('')}><X size={17} /></button>}
        </label>
      </form>
    </div>
    {offline && <ErrorState message="You are offline. Cached categories remain available." />}
    {error && <ErrorState message={error} />}
    {search.trim() && <section className="home-search-results" aria-live="polite" aria-label="Search results">
      <div className="home-search-results-heading"><h2>Search results</h2><span>{matchingProducts.length} found</span></div>
      <ProductList products={matchingProducts} relatedSearchTerm={search} />
    </section>}
    <section className="home-category-showcase" aria-labelledby="home-categories-title">
      <div className="home-section-heading"><div><span>EXPLORE</span><h2 id="home-categories-title">Shop by category</h2></div><ShoppingBag size={24} /></div>
      <CoverflowCarousel slides={slides} cardWidth="clamp(170px, 52vw, 245px)" cardClassName="home-category-card" showCaption showNavigation showPagination label="Medicine categories" onSlideClick={(slide) => {
        const categorySlide = slide as HomeSlide
        if (categorySlide.category) navigate(`/categories/${encodeURIComponent(categorySlide.category)}`)
      }} />
    </section>
  </section>
}