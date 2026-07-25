import { Link } from 'react-router-dom'
import { ClipboardList, Download, PackageSearch, ShieldCheck, ShoppingCart, Sparkles } from 'lucide-react'
import { useCatalogue } from '../hooks/useCatalogue'
import { useCart } from '../hooks/useCart'
import { useLaunch } from '../hooks/useLaunch'
import { formatDate } from '../utils/formatting'

export function Home() {
  const { catalogue } = useCatalogue()
  const { totalProducts, totalQuantity } = useCart()
  const { customerName } = useLaunch()
  const categories = catalogue?.categories.slice(0, 6) ?? []

  return (
    <section className="page-stack">
      <div className="home-hero">
        <div>
          <span className="hero-kicker"><Sparkles size={15} /> Live catalogue</span>
          <h1>{customerName ? `Hello, ${customerName}` : 'Partner Order'}</h1>
          <p>Browse products, build a cart, and send wholesale medicine orders from phone or desktop.</p>
        </div>
        <div className="hero-actions">
          <Link className="button primary" to="/catalogue"><PackageSearch size={18} />Browse Catalogue</Link>
          <Link className="button ghost" to="/admin/orders"><ShieldCheck size={18} />Admin</Link>
        </div>
      </div>

      <div className="dashboard-grid">
        <article><PackageSearch size={22} /><h2>Catalogue</h2><p>{catalogue?.availableProductCount ?? 0} available products</p><small>Updated {formatDate(catalogue?.publishedAt)}</small></article>
        <article><ShoppingCart size={22} /><h2>Cart</h2><p>{totalProducts} products - {totalQuantity} quantity</p><Link className="text-link" to="/cart">Review cart</Link></article>
        <article><ClipboardList size={22} /><h2>Orders</h2><p>Track submitted order status and reorder quickly.</p><Link className="text-link" to="/orders">View orders</Link></article>
        <article><Download size={22} /><h2>Install</h2><p>Add the app to your phone home screen.</p><Link className="text-link" to="/install">Install guidance</Link></article>
      </div>

      <section>
        <h2>Category shortcuts</h2>
        <div className="chip-row">{categories.map((item) => <Link key={item} to={`/catalogue?category=${encodeURIComponent(item)}`}>{item}</Link>)}</div>
      </section>

      <section className="offer-strip">
        <h2>Active offers</h2>
        <Link className="button secondary" to="/offers">View offers</Link>
      </section>
    </section>
  )
}
