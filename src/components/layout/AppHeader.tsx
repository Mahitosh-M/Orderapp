import { RefreshCw, ShoppingCart } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { APP_CONFIG } from '../../utils/constants'
import { useCart } from '../../hooks/useCart'
import { useCatalogue } from '../../hooks/useCatalogue'

function Logo() {
  return (
    <Link className="logo" to="/">
      <span className="logo-mark">PO</span>
      <span>{APP_CONFIG.name}</span>
    </Link>
  )
}

export function AppHeader() {
  const { totalQuantity } = useCart()
  const { refresh, refreshing, offline } = useCatalogue()
  const navigate = useNavigate()

  return (
    <header className="app-header">
      <Logo />
      <nav className="desktop-nav" aria-label="Primary">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/catalogue">Catalogue</NavLink>
        <NavLink to="/offers">Offers</NavLink>
        <NavLink to="/orders">Orders</NavLink>
        <NavLink to="/admin/orders">Admin orders</NavLink>
      </nav>
      <div className="header-actions">
        {offline && <span className="offline-pill">Offline</span>}
        <button title="Refresh catalogue" aria-label="Refresh catalogue" className="icon-button" disabled={refreshing} onClick={() => void refresh()}>
          <RefreshCw size={19} />
        </button>
        <button title="Cart" aria-label="Cart" className="icon-button cart-icon" onClick={() => navigate('/cart')}>
          <ShoppingCart size={20} />
          {totalQuantity > 0 && <span>{totalQuantity}</span>}
        </button>
      </div>
    </header>
  )
}
