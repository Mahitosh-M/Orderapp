import { useEffect, useState } from 'react'
import { loadProductImage } from '../../services/productImageService'
export function ProductImage({ src, alt, productId }: { src: string; alt: string; productId?: string }) {
  const [override, setOverride] = useState<{ id: string; url: string | null } | null>(null)
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const [element, setElement] = useState<HTMLElement | null>(null)
  const source = override && override.id === productId && override.url ? override.url : src
  useEffect(() => {
    if (!productId || !element) return
    let cancelled = false, visible = false
    const load = () => { void loadProductImage(productId).then(url => { if (!cancelled) setOverride({ id: productId, url }) }) }
    const changed = (event: Event) => { if ((event as CustomEvent).detail === productId && visible) load() }
    window.addEventListener('orderapp-product-image', changed)
    let observer: IntersectionObserver | undefined
    if (typeof IntersectionObserver === 'undefined') { visible = true; load() }
    else {
      observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { visible = true; load(); observer?.disconnect() } }, { rootMargin: '200px' })
      observer.observe(element)
    }
    return () => { cancelled = true; observer?.disconnect(); window.removeEventListener('orderapp-product-image', changed) }
  }, [productId, element])
  return failedSrc === source || !source ? <div ref={setElement} className="product-image fallback" aria-label={alt}><span>Rx</span></div>
    : <img ref={setElement} className="product-image" src={source} alt={alt} loading="lazy" onError={() => setFailedSrc(source)} />
}
