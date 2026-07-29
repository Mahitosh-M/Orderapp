import { ClipboardList, ShoppingCart, Sparkles } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'
import { useCatalogue } from '../../hooks/useCatalogue'
import { useLaunch } from '../../hooks/useLaunch'

function Logo({ label, isStaff }: { label: string; isStaff: boolean }) {
  return (
    <Link className="logo" to="/">
      <span className="logo-mark">{isStaff ? 'ST' : label.slice(0, 2).toUpperCase()}</span>
      <span className="logo-copy">
        <strong>{label}</strong>
        <small><Sparkles size={12} /> {isStaff ? 'Staff Orders' : 'Catalogue'}</small>
      </span>
    </Link>
  )
}

export function AppHeader() {
  const { totalQuantity } = useCart()
  const { offline } = useCatalogue()
  const { isStaff, returnUrl } = useLaunch()
  const navigate = useNavigate()
  const headerName = isStaff ? 'Staff' : 'Catalogue'

  return (
    <header className="app-header">
      <Logo label={headerName} isStaff={isStaff} />
      <nav className="desktop-nav" aria-label="Primary">
        {isStaff ? (
          <NavLink to="/staff/orders"><ClipboardList size={16} />Orders</NavLink>
        ) : (
          <>
            <NavLink to="/" end>Catalogue</NavLink>
            <NavLink to="/orders">Orders</NavLink>
          </>
        )}
      </nav>
      <div className="header-actions">
        {!isStaff && (
          <button title="Cart" aria-label="Cart" className="icon-button cart-icon" onClick={() => navigate('/cart')}>
            <ShoppingCart size={20} />
            {totalQuantity > 0 && <span>{totalQuantity}</span>}
          </button>
        )}
        {isStaff && (
          <button type="button" title="Go to CISapp" className="button cis-return-button" onClick={() => window.location.assign(returnUrl)}>
            <span>CISapp</span>
          </button>
        )}
        {offline && <span className="offline-pill">Offline</span>}
      </div>
    </header>
  )
}
