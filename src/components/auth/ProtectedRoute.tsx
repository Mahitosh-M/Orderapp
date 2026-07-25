import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { LoadingState } from '../common/LoadingState'
import { useAuth } from '../../hooks/useAuth'
import { isFirebaseConfigured } from '../../services/firebase'

export function ProtectedRoute({ staffOnly = false }: { staffOnly?: boolean }) {
  const { user, customer, loading, isStaff } = useAuth()
  const location = useLocation()
  if (loading) return <LoadingState label="Checking session" />
  if (!isFirebaseConfigured()) return <Outlet />
  if (!user || !customer) return <Navigate to="/login" replace state={{ from: location }} />
  if (staffOnly && !isStaff) return <Navigate to="/" replace />
  return <Outlet />
}
