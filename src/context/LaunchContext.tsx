import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { CustomerProfile } from '../types/customer'

export type LaunchRole = 'customer' | 'staff'

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
  isStaff: boolean
  isCustomer: boolean
  loading: boolean
  error: string | null
}

export const LaunchContext = createContext<LaunchContextValue | undefined>(undefined)

const storageKey = 'partner-order-launch-session'
const allowedOpenerHost = 'cisapp-236ab.web.app'

function parseRole(value: string | null): LaunchRole | null {
  const normalized = value?.trim().toLowerCase()
  if (normalized === 'customer' || normalized === 'staff') return normalized
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

function createLaunchProfile(name: string, role: LaunchRole): CustomerProfile {
  return {
    uid: name,
    customerCode: name,
    businessName: name,
    ownerName: name,
    mobile: '',
    email: '',
    address: '',
    active: true,
    role,
    createdAt: '',
    updatedAt: '',
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
    const params = new URLSearchParams(window.location.search)
    const name = (params.get('name') ?? params.get('customerName') ?? params.get('userName'))?.trim()
    const role = parseRole(params.get('role'))

    if (!name && !role) return

    if (!launchedFromAllowedHost()) {
      setError('Open this app from CISapp.')
      return
    }

    if (!name || !role) {
      setError('Missing name or role launch parameter.')
      return
    }

    if (role !== 'customer' && role !== 'staff') {
      setError('Ordering App can only be opened by customer or staff.')
      return
    }

    const profile = createLaunchProfile(name, role)
    const nextSession = {
      uid: name,
      customerId: name,
      customerName: name,
      role,
      profile,
    }
    window.sessionStorage.setItem(storageKey, JSON.stringify(nextSession))
    setSession(nextSession)
    setLoading(false)
    setError(null)
  }, [])

  const value = useMemo(
    () => ({
      session,
      profile: session?.profile ?? null,
      uid: session?.uid ?? '',
      customerId: session?.customerId ?? '',
      customerName: session?.customerName ?? '',
      role: session?.role ?? null,
      isStaff: session?.role === 'staff',
      isCustomer: session?.role === 'customer',
      loading,
      error,
    }),
    [session, loading, error],
  )

  return <LaunchContext.Provider value={value}>{children}</LaunchContext.Provider>
}
