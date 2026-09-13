import { PackageCheck, ShoppingCart, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Product } from '../../types/product'
import { formatMrp } from '../../utils/formatting'
import { useCart } from '../../hooks/useCart'
import { useCatalogue } from '../../hooks/useCatalogue'
import { InteractiveProductCard } from '../ui/card-7'
import { ProductImage } from './ProductImage'
import { QuantitySelector } from './QuantitySelector'

export function ProductCard({ product, relatedSearchTerm = '' }: { product: Product; relatedSearchTerm?: string }) {
  const { addProduct, items, updateQuantity } = useCart()
  const { catalogue } = useCatalogue()
  const cartItem = items.find((item) => item.productId === product.id)
  const hasExactSearchMatch = relatedSearchTerm.trim().toLowerCase() === product.name.trim().toLowerCase()
  const hasSearchContext = Boolean(relatedSearchTerm.trim())
  const selectedProductIds = new Set(items.map((item) => item.productId))
  const relatedProducts = hasExactSearchMatch || (cartItem && hasSearchContext)
    ? (catalogue?.products ?? [])
      .filter((item) => item.id !== product.id && !selectedProductIds.has(item.id) && item.available && item.composition.trim().toLowerCase() === product.composition.trim().toLowerCase())
      .slice(0, 12)
    : []

  const renderCard = (item: Product, suggestion = false) => {
    const itemInCart = items.find((entry) => entry.productId === item.id)
    return (
      <InteractiveProductCard
        key={item.id}
        className={suggestion ? 'interactive-product-card--suggestion' : undefined}
        imageUrl={item.imageUrl}
        title={item.name}
        description={item.composition}
        price={formatMrp(item.mrp)}
        role="group"
        aria-label={item.name}
        titleContent={<Link to={`/catalogue/${item.id}`}>{item.name}</Link>}
        media={<Link to={`/catalogue/${item.id}`}><ProductImage key={item.imageUrl} src={item.imageUrl} alt={item.name} /></Link>}
        badge={
          <span className={`interactive-product-card__stock ${item.available ? 'is-available' : 'is-unavailable'}`}
            title={item.available ? 'Available' : 'Unavailable'} aria-label={item.available ? 'Available' : 'Unavailable'}>
            <PackageCheck size={12} aria-hidden="true" />{item.available ? 'Stock' : 'Hold'}
          </span>
        }
        metadata={<><span>{item.company}</span><span>{item.packing}</span></>}
        actions={itemInCart ? (
          <QuantitySelector value={itemInCart.quantity} allowZero onChange={(quantity) => updateQuantity(item.id, quantity)} />
        ) : (
          <button className="button primary compact-add" type="button" disabled={!item.available}
            aria-label={`Add ${item.name} to cart`} onClick={() => addProduct(item, 1)}>
            <ShoppingCart size={17} aria-hidden="true" />Add
          </button>
        )}
      />
    )
  }

  return (
    <article className="product-card-group">
      {renderCard(product)}
      {relatedProducts.length > 0 && (
        <section className="product-card-suggestions" aria-label={`Similar ${product.composition} products`}>
          <p className="product-card-suggestions__heading"><Sparkles size={14} aria-hidden="true" />Similar products</p>
          <div className="product-card-suggestions__list">
            {relatedProducts.map((item) => renderCard(item, true))}
          </div>
        </section>
      )}
    </article>
  )
}
