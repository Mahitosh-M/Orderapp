import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AppHeader } from './AppHeader'
import { BottomNavigation } from './BottomNavigation'
import { useLaunch } from '../../hooks/useLaunch'

export function CustomerLayout() {
  const { error } = useLaunch()
  const { pathname, search } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, search])

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
