import { inMemoryPersistence, setPersistence, signInWithCustomToken } from 'firebase/auth'
import { getCategoryAdminServices, requireCategoryAdmin } from './categoryAdminService'
const sources = new Set(['https://cisapp-236ab.web.app', 'https://cisapp-236ab.firebaseapp.com', 'http://127.0.0.1:5173', 'http://localhost:5173'])
export function acceptAdminHandoff(onError: (message: string) => void) {
  const params = new URLSearchParams(window.location.hash.slice(1))
  const nonce = params.get('nonce'), source = params.get('source'), parent = window.opener
  if (!parent || !source || !sources.has(source) || !nonce || !/^[a-f0-9-]{36}$/i.test(nonce)) {
    onError('Open Orderapp using the Order button in CISapp Admin.'); return () => {}
  }
  let receiving = false, cancelled = false
  const cleanup = () => { cancelled = true; clearInterval(interval); clearTimeout(timeout); window.removeEventListener('message', receive) }
  const receive = async (event: MessageEvent) => {
    if (receiving || event.source !== parent || event.origin !== source || event.data?.type !== 'cisapp-admin-session'
      || event.data?.nonce !== nonce || typeof event.data.token !== 'string' || event.data.token.length > 16384) return
    receiving = true
    clearInterval(interval)
    try {
      const { auth } = getCategoryAdminServices()
      await setPersistence(auth, inMemoryPersistence)
      await signInWithCustomToken(auth, event.data.token)
      await requireCategoryAdmin()
      if (!cancelled) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search)
        parent.postMessage({ type: 'orderapp-admin-connected', nonce }, source)
      }
    } catch { if (!cancelled) onError('Unable to verify Admin access. Reopen Orderapp from CISapp Admin.') }
    finally { cleanup(); window.opener = null }
  }
  const ready = () => parent.postMessage({ type: 'orderapp-admin-ready', nonce }, source)
  window.addEventListener('message', receive)
  const interval = window.setInterval(ready, 500)
  const timeout = window.setTimeout(() => { cleanup(); onError('Admin connection expired. Reopen Orderapp from CISapp Admin.') }, 60000)
  ready()
  return cleanup
}
