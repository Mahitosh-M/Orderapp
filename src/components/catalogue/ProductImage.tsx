import { useState } from 'react'

export function ProductImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false)
  return failed || !src ? (
    <div className="product-image fallback" aria-label={alt}>
      <span>Rx</span>
    </div>
  ) : (
    <img className="product-image" src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />
  )
}
