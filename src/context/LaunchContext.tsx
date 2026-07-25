import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { CustomerProfile } from '../types/customer'

export type LaunchRole = 'customer' | 'staff'

export interface LaunchSession {
  uid: string
  customerId: string
  customerName: string
  customerArea: string
  role: LaunchRole
  returnUrl: string
  profile: CustomerProfile
}

interface LaunchContextValue {
  session: LaunchSession | null
  profile: CustomerProfile | null
  uid: string
  customerId: string
  customerName: string
  customerArea: string
  role: LaunchRole | null
  returnUrl: string
  isStaff: boolean
  isCustomer: boolean
  loading: boolean
  error: string | null
}

export const LaunchContext = createContext<LaunchContextValue | undefined>(undefined)

const storageKey = 'partner-order-launch-session'
function parseRole(value: string | null): LaunchRole | null {
  const normalized = value?.trim().toLowerCase()
  if (normalized === 'customer' || normalized === 'staff') return normalized
  return null
}

function parseReturnUrl(value: string | null) {
  const fallbackUrl = 'https://cisapp-236ab.web.app'
  if (!value) return fallbackUrl

  try {
    const url = new URL(value)
    const allowedHosts = ['cisapp-236ab.web.app', 'localhost', '127.0.0.1']
    return allowedHosts.includes(url.hostname) ? url.toString() : fallbackUrl
  } catch {
    return fallbackUrl
  }
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
      customerArea: parsed.customerArea ?? parsed.profile.area ?? '',
      returnUrl: parseReturnUrl(parsed.returnUrl ?? null),
      profile: parsed.profile,
    }
  } catch {
    return null
  }
}

function createLaunchProfile(name: string, role: LaunchRole, customerId: string, area: string): CustomerProfile {
  return {
    uid: customerId,
    customerCode: customerId,
    businessName: name,
    ownerName: name,
    mobile: '',
    email: '',
    address: area,
    area,
    active: true,
    role,
    createdAt: '',
    updatedAt: '',
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
    const customerId = (params.get('customerId') ?? params.get('customerID') ?? params.get('id') ?? name)?.trim()
    const area = (params.get('area') ?? params.get('customerArea') ?? '')?.trim()
    const returnUrl = parseReturnUrl(params.get('returnUrl'))

    if (!name && !role) return

    if (!name || !role) {
      setError('Missing name or role launch parameter.')
      return
    }

    if (role !== 'customer' && role !== 'staff') {
      setError('Ordering App can only be opened by customer or staff.')
      return
    }

    const profile = createLaunchProfile(name, role, customerId || name, area)
    const nextSession = {
      uid: customerId || name,
      customerId: customerId || name,
      customerName: name,
      customerArea: area,
      role,
      returnUrl,
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
      customerArea: session?.customerArea ?? '',
      role: session?.role ?? null,
      returnUrl: session?.returnUrl ?? parseReturnUrl(null),
      isStaff: session?.role === 'staff',
      isCustomer: session?.role === 'customer',
      loading,
      error,
    }),
    [session, loading, error],
  )

  return <LaunchContext.Provider value={value}>{children}</LaunchContext.Provider>
}
