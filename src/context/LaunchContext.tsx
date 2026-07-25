import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { CustomerProfile } from '../types/customer'
import { loadLaunchProfile } from '../services/launchService'

export type LaunchRole = 'customer' | 'admin'

export interface LaunchSession {
  uid: string
  customerId: string
  customerName: string
  role: LaunchRole
  profile: CustomerProfile
}

interface LaunchContextValue {
  session: LaunchSession | null
  profile: CustomerProfile | null
  uid: string
  customerId: string
  customerName: string
  role: LaunchRole | null
  isAdmin: boolean
  isCustomer: boolean
  loading: boolean
  error: string | null
}

export const LaunchContext = createContext<LaunchContextValue | undefined>(undefined)

const storageKey = 'partner-order-launch-session'
const allowedOpenerHost = 'cisapp-236ab.web.app'

function parseRole(value: string | null): LaunchRole | null {
  if (value === 'customer' || value === 'admin') return value
  return null
}

function loadStoredSession(): LaunchSession | null {
  try {
    const stored = window.sessionStorage.getItem(storageKey)
    if (!stored) return null
    const parsed = JSON.parse(stored) as Partial<LaunchSession>
    const role = parseRole(parsed.role ?? null)
    if (!role || !parsed.customerName || !parsed.uid || !parsed.profile) return null
    return {
      uid: parsed.uid,
      customerId: parsed.customerId ?? parsed.profile.customerCode,
      role,
      customerName: parsed.customerName,
      profile: parsed.profile,
    }
  } catch {
    return null
  }
}

function launchedFromAllowedHost() {
  if (!document.referrer) return false
  try {
    return new URL(document.referrer).host === allowedOpenerHost
  } catch {
    return false
  }
}

export function LaunchProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<LaunchSession | null>(() => loadStoredSession())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const params = new URLSearchParams(window.location.search)
    const uid = (params.get('uid') ?? params.get('UID'))?.trim()
    const customerId = (
      params.get('customerId') ??
      params.get('customerID') ??
      params.get('Customerid') ??
      params.get('customerid')
    )?.trim()

    if (!uid && !customerId) return

    if (!launchedFromAllowedHost()) {
      setError('Open this app from CISapp.')
      return
    }

    if (!uid) {
      setError('Missing uid launch parameter.')
      return
    }

    setLoading(true)
    setError(null)
    loadLaunchProfile(uid, customerId)
      .then((profile) => {
        if (cancelled) return
        const nextSession = {
          uid,
          customerId: customerId ?? profile.customerCode,
          customerName: profile.businessName,
          role: profile.role,
          profile,
        }
        window.sessionStorage.setItem(storageKey, JSON.stringify(nextSession))
        setSession(nextSession)
      })
      .catch((nextError: Error) => {
        if (cancelled) return
        setError(nextError.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo(
    () => ({
      session,
      profile: session?.profile ?? null,
      uid: session?.uid ?? '',
      customerId: session?.customerId ?? '',
      customerName: session?.customerName ?? '',
      role: session?.role ?? null,
      isAdmin: session?.role === 'admin',
      isCustomer: session?.role === 'customer',
      loading,
      error,
    }),
    [session, loading, error],
  )

  return <LaunchContext.Provider value={value}>{children}</LaunchContext.Provider>
}
