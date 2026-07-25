import { useEffect, useState } from 'react'
import type { Offer } from '../types/offer'
import { EmptyState } from '../components/common/EmptyState'

export function Offers() {
  const [offers, setOffers] = useState<Offer[]>([])
  useEffect(() => { fetch('/offers/offers.json').then((res) => res.json()).then((items: Offer[]) => setOffers(items.filter((offer) => offer.active))).catch(() => setOffers([])) }, [])
  if (offers.length === 0) return <EmptyState title="No active offers" message="Supplier offers will appear here when available." />
  return <section className="page-stack"><h1>Offers</h1><div className="offer-grid">{offers.map((offer) => <article className="offer-card" key={offer.id}><img src={offer.imageUrl} alt="" /><h2>{offer.title}</h2><p>{offer.description}</p>{offer.validUntil && <small>Valid until {offer.validUntil}</small>}</article>)}</div></section>
}
