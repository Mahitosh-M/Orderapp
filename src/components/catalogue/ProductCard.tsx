import { PackageCheck, ShoppingCart, Sparkles } from 'lucide-react'
import { useId, useState, type ReactElement } from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '../../types/product'
import { formatMrp } from '../../utils/formatting'
import { useCart } from '../../hooks/useCart'
import { useCatalogue } from '../../hooks/useCatalogue'
import { InteractiveProductCard } from '../ui/card-7'
import { ProductImage } from './ProductImage'
import { QuantitySelector } from './QuantitySelector'

interface ProductCardProps {
  product: Product
  relatedSearchTerm?: string
  suggestion?: boolean
  ancestorIds?: readonly string[]
}

export function ProductCard({ product, relatedSearchTerm = '', suggestion = false, ancestorIds = [] }: ProductCardProps): ReactElement {
  const { addProduct, items, updateQuantity } = useCart()
  const { catalogue } = useCatalogue()
  const [relatedOpen, setRelatedOpen] = useState<boolean | null>(null)
  const relatedId = useId()
  const cartItem = items.find((item) => item.productId === product.id)
  const hasExactSearchMatch = relatedSearchTerm.trim().toLowerCase() === product.name.trim().toLowerCase()
  const showRelated = relatedOpen ?? (hasExactSearchMatch || Boolean(cartItem && relatedSearchTerm.trim()))
  const excludedIds = new Set([product.id, ...ancestorIds, ...items.map((item) => item.productId)])
  const relatedProducts = showRelated
    ? (catalogue?.products ?? [])
      .filter((item) => !excludedIds.has(item.id) && item.available && item.composition.trim().toLowerCase() === product.composition.trim().toLowerCase())
      .slice(0, 12)
    : []
  const toggleRelated = () => setRelatedOpen(!showRelated)

  return (
    <article className="product-card-group">
      <InteractiveProductCard
        className={suggestion ? 'interactive-product-card--suggestion' : undefined}
        imageUrl={product.imageUrl}
        title={product.name}
        description={product.composition}
        price={formatMrp(product.mrp)}
        role="group"
        aria-label={product.name}
        onClick={(event) => {
          if ((event.target as Element).closest('a, button, input, select, textarea')) return
          toggleRelated()
        }}
        titleContent={<button type="button" className="interactive-product-card__title-button" aria-expanded={showRelated} aria-controls={showRelated ? relatedId : undefined} onClick={toggleRelated}>{product.name}</button>}
        media={<button type="button" className="interactive-product-card__image-button" aria-label={(showRelated ? 'Hide' : 'Show') + ' similar products for ' + product.name} aria-expanded={showRelated} aria-controls={showRelated ? relatedId : undefined} onClick={toggleRelated}><ProductImage key={product.imageUrl} productId={product.id} src={product.imageUrl} alt={product.name} /></button>}
        badge={
          <span className={`interactive-product-card__stock ${product.available ? 'is-available' : 'is-unavailable'}`}
            title={product.available ? 'Available' : 'Unavailable'} aria-label={product.available ? 'Available' : 'Unavailable'}>
            <PackageCheck size={12} aria-hidden="true" />{product.available ? 'Stock' : 'Hold'}
          </span>
        }
        metadata={<><span>{product.company}</span><span>{product.packing}</span><Link className="interactive-product-card__details-link" to={`/catalogue/${product.id}`}>Details</Link></>}
        actions={cartItem ? (
          <QuantitySelector value={cartItem.quantity} allowZero onChange={(quantity) => updateQuantity(product.id, quantity)} />
        ) : (
          <button className="button primary compact-add" type="button" disabled={!product.available}
            aria-label={`Add ${product.name} to cart`} onClick={() => { addProduct(product, 1); setRelatedOpen(true) }}>
            <ShoppingCart size={17} aria-hidden="true" />Add
          </button>
        )}
      />
      {showRelated && (
        <section id={relatedId} className="product-card-suggestions" aria-label={`Similar products for ${product.name}`}>
          <p className="product-card-suggestions__heading"><Sparkles size={14} aria-hidden="true" />Similar products</p>
          {relatedProducts.length ? <div className="product-card-suggestions__list">
            {relatedProducts.map((item) => <ProductCard key={item.id} product={item} suggestion ancestorIds={[...ancestorIds, product.id]} />)}
          </div> : <p className="product-card-suggestions__empty">No similar products available.</p>}
        </section>
      )}
    </article>
  )
}
