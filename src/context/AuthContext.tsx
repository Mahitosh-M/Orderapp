import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import type { CustomerProfile } from '../types/customer'
import { getFirebaseServices, isFirebaseConfigured } from '../services/firebase'
import { loadCustomerProfile, loginWithEmail, logoutFirebase } from '../services/authService'

interface AuthContextValue {
  user: User | null
  customer: CustomerProfile | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isStaff: boolean
  isCustomer: boolean
  authError: string | null
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function friendlyAuthError(error: unknown) {
  const code = error && typeof error === 'object' && 'code' in error ? String((error as { code: unknown }).code) : ''
  if (code.includes('invalid-credential')) return 'Invalid email or password.'
  if (code.includes('user-disabled')) return 'This account is disabled. Contact the supplier.'
  if (code.includes('permission-denied')) return 'You do not have permission to access this data.'
  return error instanceof Error ? error.message : 'Authentication failed.'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [customer, setCustomer] = useState<CustomerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setLoading(false)
      return undefined
    }
    const { auth } = getFirebaseServices()
    return onAuthStateChanged(auth, async (nextUser) => {
      setLoading(true)
      setAuthError(null)
      setUser(nextUser)
      setCustomer(null)
      if (nextUser) {
        try {
          setCustomer(await loadCustomerProfile(nextUser))
        } catch (error) {
          setAuthError(friendlyAuthError(error))
          await logoutFirebase()
        }
      }
      setLoading(false)
    })
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setAuthError(null)
    try {
      const nextUser = await loginWithEmail(email, password)
      const nextCustomer = await loadCustomerProfile(nextUser)
      setUser(nextUser)
      setCustomer(nextCustomer)
    } catch (error) {
      await logoutFirebase()
      throw new Error(friendlyAuthError(error), { cause: error })
    }
  }, [])

  const logout = useCallback(async () => {
    setCustomer(null)
    setUser(null)
    if (isFirebaseConfigured()) await logoutFirebase()
  }, [])

  const value = useMemo(
    () => ({ user, customer, loading, login, logout, isStaff: customer?.role === 'staff', isCustomer: customer?.role === 'customer', authError }),
    [user, customer, loading, login, logout, authError],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
