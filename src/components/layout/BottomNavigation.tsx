import { ListOrdered, PackageSearch, ShieldCheck } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useLaunch } from '../../hooks/useLaunch'

const items = [
  { to: '/', label: 'Catalogue', icon: PackageSearch },
  { to: '/orders', label: 'Orders', icon: ListOrdered },
]

export function BottomNavigation() {
  const { isStaff } = useLaunch()

  if (isStaff) {
    return (
      <nav className="bottom-nav admin-bottom-nav" aria-label="Staff">
        <NavLink to="/staff/orders">
          <ShieldCheck size={20} />
          <span>Orders</span>
        </NavLink>
      </nav>
    )
  }

  return (
    <nav className="bottom-nav" aria-label="Primary">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} end={to === '/'}>
          <Icon size={20} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
