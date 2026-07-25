import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { CataloguePayload } from '../types/product'
import { loadCatalogue } from '../services/catalogueService'

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
    setRefreshing(force)
    const result = await loadCatalogue(force)
    setCatalogue(result.catalogue)
    setFromCache(result.fromCache)
    setError(result.error)
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => {
    void runLoad(false)
    const syncOnline = () => setOffline(!navigator.onLine)
    window.addEventListener('online', syncOnline)
    window.addEventListener('offline', syncOnline)
    return () => {
      window.removeEventListener('online', syncOnline)
      window.removeEventListener('offline', syncOnline)
    }
  }, [runLoad])

  const value = useMemo(
    () => ({ catalogue, loading, refreshing, error, fromCache, offline, refresh: () => runLoad(true) }),
    [catalogue, loading, refreshing, error, fromCache, offline, runLoad],
  )
  return <CatalogueContext.Provider value={value}>{children}</CatalogueContext.Provider>
}
