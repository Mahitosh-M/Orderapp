import { Outlet } from 'react-router-dom'
import { AppHeader } from './AppHeader'
import { BottomNavigation } from './BottomNavigation'
import { useLaunch } from '../../hooks/useLaunch'

export function CustomerLayout() {
  const { error } = useLaunch()

  return (
    <div className="app-shell">
      <AppHeader />
      <main className="app-main">
        {error && <div className="launch-warning">{error}</div>}
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  )
}
