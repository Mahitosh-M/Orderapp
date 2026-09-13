"use client";

import * as React from 'react'
import { Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import './card-7.css'

interface InteractiveProductCardProps extends React.HTMLAttributes<HTMLDivElement> {
  imageUrl: string
  logoUrl?: string
  title: string
  description: string
  price: string
  titleContent?: React.ReactNode
  media?: React.ReactNode
  badge?: React.ReactNode
  metadata?: React.ReactNode
  actions?: React.ReactNode
}

// The supplied card adapted for real catalogue details and cart controls.
export function InteractiveProductCard({
  className, imageUrl, logoUrl, title, description, price,
  titleContent, media, badge, metadata, actions, style,
  onPointerMove, onPointerLeave, onPointerCancel, children, ...props
}: InteractiveProductCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null)
  const resetTilt = () => {
    cardRef.current?.style.removeProperty('--card-rotate-x')
    cardRef.current?.style.removeProperty('--card-rotate-y')
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event)
    if (event.defaultPrevented || event.pointerType !== 'mouse'
      || !window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches) {
      resetTilt()
      return
    }
    const card = cardRef.current
    if (!card) return
    const { left, top, width, height } = card.getBoundingClientRect()
    if (!width || !height) return
    const x = Math.max(-1, Math.min(1, (event.clientX - left - width / 2) / (width / 2)))
    const y = Math.max(-1, Math.min(1, (event.clientY - top - height / 2) / (height / 2)))
    card.style.setProperty('--card-rotate-x', `${y * -4}deg`)
    card.style.setProperty('--card-rotate-y', `${x * 4}deg`)
  }

  return (
    <div {...props} ref={cardRef} style={style}
      className={cn('interactive-product-card', className)}
      onPointerMove={handlePointerMove}
      onPointerLeave={(event) => { resetTilt(); onPointerLeave?.(event) }}
      onPointerCancel={(event) => { resetTilt(); onPointerCancel?.(event) }}>
      <div className="interactive-product-card__glow" aria-hidden="true" />
      <header className="interactive-product-card__header">
        <div className="interactive-product-card__heading">
          <h3>{titleContent ?? title}</h3>
          <p>{description}</p>
        </div>
        {badge ?? (logoUrl
          ? <img className="interactive-product-card__logo" src={logoUrl} alt="Brand logo" />
          : <Package size={22} aria-hidden="true" />)}
      </header>
      <div className="interactive-product-card__media">
        {media ?? <img src={imageUrl} alt={title} loading="lazy" />}
      </div>
      <div className="interactive-product-card__details">
        {metadata && <div className="interactive-product-card__metadata">{metadata}</div>}
        <div className="interactive-product-card__footer">
          <div className="interactive-product-card__price"><span>MRP</span><strong>{price}</strong></div>
          {actions && <div className="interactive-product-card__actions">{actions}</div>}
        </div>
        {children}
      </div>
    </div>
  )
}
