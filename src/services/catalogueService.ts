import type { CataloguePayload, CatalogueVersion } from '../types/product'
import { getCachedCatalogue, saveCachedCatalogue } from './cacheService'
import { validateCatalogue } from '../utils/validation'

export interface CatalogueLoadResult {
  catalogue: CataloguePayload | null
  fromCache: boolean
  updated: boolean
  error: string | null
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(path, { cache: 'no-store' })
  if (!response.ok) throw new Error(`Unable to fetch ${path}.`)
  return response.json() as Promise<T>
}

export function isRemoteVersionNewer(remote: CatalogueVersion, cached?: CataloguePayload | null) {
  return !cached || remote.version > cached.version
}

export async function loadCatalogue(forceRefresh = false): Promise<CatalogueLoadResult> {
  const cached = await getCachedCatalogue()
  try {
    const version = await fetchJson<CatalogueVersion>('/catalogue/catalogue-version.json')
    if (forceRefresh || isRemoteVersionNewer(version, cached)) {
      const payload = validateCatalogue(await fetchJson<CataloguePayload>('/catalogue/catalogue.json'))
      await saveCachedCatalogue(payload)
      return { catalogue: payload, fromCache: false, updated: true, error: null }
    }
    return { catalogue: cached ?? null, fromCache: !!cached, updated: false, error: null }
  } catch (error) {
    return {
      catalogue: cached ?? null,
      fromCache: !!cached,
      updated: false,
      error: error instanceof Error ? error.message : 'Catalogue update failed.',
    }
  }
}
