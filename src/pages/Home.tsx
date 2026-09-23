import { ArrowRight, ClipboardList, Search, ShoppingBag, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CoverflowCarousel, type CoverflowSlide } from '../components/ui/coverflow-carousel'
import { ErrorState } from '../components/common/ErrorState'
import { LoadingState } from '../components/common/LoadingState'
import { useCatalogue } from '../hooks/useCatalogue'

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
    const categorySlides = catalogue?.categories.map((category) => {
    const count = catalogue.products.filter((product) => product.category === category).length
    return { category, src: categoryArtwork[category.trim().toLowerCase()] ?? '/category-images/antibiotics-category.jpg', alt: `${category} medicines`, title: category, subtitle: `${count} products available` }
    }).filter((slide) => !slide.subtitle.startsWith('0 ')) ?? []
    return [...categorySlides, {
      src: '', alt: `${categorySlides.length} categories available`, title: `${categorySlides.length} categories`, subtitle: 'Swipe to explore',
      content: <div className="home-category-count-card"><span>SHOP BY CATEGORY</span><strong>{categorySlides.length}</strong><small>Categories available</small></div>,
    }]
  }, [catalogue])

  if (loading) return <LoadingState label="Preparing your home page" />
  if (!catalogue) return <ErrorState message={error ?? 'Catalogue unavailable.'} />
  const openSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = search.trim()
    navigate(value ? `/catalogue?search=${encodeURIComponent(value)}` : '/catalogue')
  }

  return <section className="order-home page-stack">
    <div className="home-hero">
      <span className="home-kicker"><Sparkles size={14} /> QUICK & SIMPLE ORDERING</span>
      <h1>What do you need today?</h1>
      <p>Browse trusted products by category or search the complete catalogue.</p>
      <form className="home-search-form" onSubmit={openSearch}>
        <label className="home-search-field search-field">
          <Search size={19} aria-hidden="true" />
          <span className="sr-only">Search medicines and products</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search medicines and products" />
        </label>
      </form>
    </div>
    {offline && <ErrorState message="You are offline. Cached categories remain available." />}
    {error && <ErrorState message={error} />}
    <section className="home-category-showcase" aria-labelledby="home-categories-title">
      <div className="home-section-heading"><div><span>EXPLORE</span><h2 id="home-categories-title">Shop by category</h2></div><ShoppingBag size={24} /></div>
      <CoverflowCarousel slides={slides} cardWidth="clamp(170px, 52vw, 245px)" showCaption showNavigation showPagination label="Medicine categories" onSlideClick={(slide) => {
        const categorySlide = slide as HomeSlide
        if (categorySlide.category) navigate(`/categories/${encodeURIComponent(categorySlide.category)}`)
      }} />
    </section>
    <div className="home-quick-actions">
      <Link to="/catalogue"><span><Search size={21} /></span><div><strong>Full catalogue</strong><small>Search every product</small></div><ArrowRight size={18} /></Link>
      <Link to="/orders"><span><ClipboardList size={21} /></span><div><strong>My orders</strong><small>Track previous orders</small></div><ArrowRight size={18} /></Link>
    </div>
  </section>
}
