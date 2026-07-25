import { ClipboardList, ShoppingCart } from 'lucide-react'
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
  const { offline } = useCatalogue()
  const { customerName, isStaff } = useLaunch()
  const navigate = useNavigate()

  return (
    <header className="app-header">
      <Logo />
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
        {customerName && <span className="role-pill">{isStaff ? 'Staff' : customerName}</span>}
        {offline && <span className="offline-pill">Offline</span>}
        {!isStaff && (
          <>
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
