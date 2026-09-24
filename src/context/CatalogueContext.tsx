import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { CataloguePayload } from '../types/product'
import { getCachedCatalogue } from '../services/cacheService'
import { loadCatalogue } from '../services/catalogueService'

const autoRefreshMs = 5 * 60 * 1000

interface CatalogueContextValue {
  catalogue: CataloguePayload | null
  loading: boolean
  refreshing: boolean
  error: string | null
  fromCache: boolean
  offline: boolean
  refresh: () => Promise<void>
}

export const CatalogueContext = createContext<CatalogueContextValue | undefined>(undefined)

export function CatalogueProvider({ children }: { children: ReactNode }) {
  const [catalogue, setCatalogue] = useState<CataloguePayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fromCache, setFromCache] = useState(false)
  const [offline, setOffline] = useState(!navigator.onLine)

  const runLoad = useCallback(async (force = false) => {
    if (!navigator.onLine && force) return
    setRefreshing(force)
    const result = await loadCatalogue(force)
    setCatalogue(result.catalogue)
    setFromCache(result.fromCache)
    setError(result.error)
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => {
    let cancelled = false
    const loadInitialCatalogue = async () => {
      const cached = await getCachedCatalogue()
      if (cached && !cancelled) {
        setCatalogue(cached)
        setFromCache(true)
        setLoading(false)
      }
      if (!cancelled) await runLoad(false)
    }
    void loadInitialCatalogue()
    const syncOnline = () => {
      const isOffline = !navigator.onLine
      setOffline(isOffline)
      if (!isOffline) void runLoad(true)
    }
    const refreshVisibleCatalogue = () => {
      if (document.visibilityState === 'visible') void runLoad(true)
    }
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible' && navigator.onLine) void runLoad(true)
    }, autoRefreshMs)

    window.addEventListener('online', syncOnline)
    window.addEventListener('offline', syncOnline)
    document.addEventListener('visibilitychange', refreshVisibleCatalogue)
    return () => {
      cancelled = true
      window.clearInterval(interval)
      window.removeEventListener('online', syncOnline)
      window.removeEventListener('offline', syncOnline)
      document.removeEventListener('visibilitychange', refreshVisibleCatalogue)
    }
  }, [runLoad])

  const value = useMemo(
    () => ({ catalogue, loading, refreshing, error, fromCache, offline, refresh: () => runLoad(true) }),
    [catalogue, loading, refreshing, error, fromCache, offline, runLoad],
  )
  return <CatalogueContext.Provider value={value}>{children}</CatalogueContext.Provider>
}
