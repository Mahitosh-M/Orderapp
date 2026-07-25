import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type LaunchRole = 'customer' | 'admin'

export interface LaunchSession {
  customerName: string
  role: LaunchRole
}

interface LaunchContextValue {
  session: LaunchSession | null
  customerName: string
  role: LaunchRole | null
  isAdmin: boolean
  isCustomer: boolean
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
    if (!role || !parsed.customerName) return null
    return { role, customerName: parsed.customerName }
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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const customerName = params.get('customerName')?.trim()
    const role = parseRole(params.get('role'))

    if (!customerName && !role) return

    if (!launchedFromAllowedHost()) {
      setError('Open this app from CISapp.')
      return
    }

    if (!customerName || !role) {
      setError('Missing customerName or role launch parameter.')
      return
    }

    const nextSession = { customerName, role }
    window.sessionStorage.setItem(storageKey, JSON.stringify(nextSession))
    setSession(nextSession)
    setError(null)
  }, [])

  const value = useMemo(
    () => ({
      session,
      customerName: session?.customerName ?? '',
      role: session?.role ?? null,
      isAdmin: session?.role === 'admin',
      isCustomer: session?.role === 'customer',
      error,
    }),
    [session, error],
  )

  return <LaunchContext.Provider value={value}>{children}</LaunchContext.Provider>
}
