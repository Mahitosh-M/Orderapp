import { Gift, Home, ListOrdered, PackageSearch, ShoppingCart, User, ShieldCheck } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'

const items = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/catalogue', label: 'Catalogue', icon: PackageSearch },
  { to: '/offers', label: 'Offers', icon: Gift },
  { to: '/orders', label: 'Orders', icon: ListOrdered },
  { to: '/profile', label: 'Profile', icon: User },
]

export function BottomNavigation() {
  const { totalQuantity } = useCart()
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} end={to === '/'}>
          <Icon size={20} />
          <span>{label}</span>
        </NavLink>
      ))}
      <NavLink to="/admin/orders"><ShieldCheck size={20} /><span>Admin</span></NavLink>
      <NavLink to="/cart" className="cart-fab" aria-label={`Cart with ${totalQuantity} items`}>
        <ShoppingCart size={22} />
        {totalQuantity > 0 && <strong>{totalQuantity}</strong>}
      </NavLink>
    </nav>
  )
}
