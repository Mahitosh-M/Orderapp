import { ClipboardList, RefreshCw, ShoppingCart } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { APP_CONFIG } from '../../utils/constants'
import { useCart } from '../../hooks/useCart'
import { useCatalogue } from '../../hooks/useCatalogue'
import { useLaunch } from '../../hooks/useLaunch'

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
  const { customerName, isAdmin } = useLaunch()
  const navigate = useNavigate()

  return (
    <header className="app-header">
      <Logo />
      <nav className="desktop-nav" aria-label="Primary">
        {isAdmin ? (
          <NavLink to="/admin/orders"><ClipboardList size={16} />Orders</NavLink>
        ) : (
          <>
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/catalogue">Catalogue</NavLink>
            <NavLink to="/offers">Offers</NavLink>
            <NavLink to="/orders">Orders</NavLink>
          </>
        )}
      </nav>
      <div className="header-actions">
        {customerName && <span className="role-pill">{isAdmin ? 'Admin' : customerName}</span>}
        {offline && <span className="offline-pill">Offline</span>}
        {!isAdmin && (
          <>
            <button title="Refresh catalogue" aria-label="Refresh catalogue" className="icon-button" disabled={refreshing} onClick={() => void refresh()}>
              <RefreshCw size={19} />
            </button>
            <button title="Cart" aria-label="Cart" className="icon-button cart-icon" onClick={() => navigate('/cart')}>
              <ShoppingCart size={20} />
              {totalQuantity > 0 && <span>{totalQuantity}</span>}
            </button>
          </>
        )}
      </div>
    </header>
  )
}
