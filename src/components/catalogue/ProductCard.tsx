import { BadgeIndianRupee, PackageCheck, ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Product } from '../../types/product'
import { formatMrp } from '../../utils/formatting'
import { useCart } from '../../hooks/useCart'
import { useCatalogue } from '../../hooks/useCatalogue'
import { ProductImage } from './ProductImage'
import { QuantitySelector } from './QuantitySelector'

export function ProductCard({ product, relatedSearchTerm = '' }: { product: Product; relatedSearchTerm?: string }) {
  const { addProduct, items, updateQuantity } = useCart()
  const { catalogue } = useCatalogue()
  const cartItem = items.find((item) => item.productId === product.id)
  const hasExactSearchMatch = relatedSearchTerm.trim().toLowerCase() === product.name.trim().toLowerCase()
  const hasSearchContext = Boolean(relatedSearchTerm.trim())
  const relatedProducts = hasExactSearchMatch || (cartItem && hasSearchContext)
    ? (catalogue?.products ?? [])
      .filter((item) => item.id !== product.id && item.available && item.composition.trim().toLowerCase() === product.composition.trim().toLowerCase())
      .slice(0, 12)
    : []

  return (
    <article className="product-card">
      <Link to={`/catalogue/${product.id}`} className="product-link">
        <ProductImage src={product.imageUrl} alt={product.name} />
      </Link>
      <div className="product-copy">
        <div className="product-info">
          <div className="product-title-row">
            <h3><Link to={`/catalogue/${product.id}`}>{product.name}</Link></h3>
            <span className={product.available ? 'stock-pill success' : 'stock-pill warning'} title={product.available ? 'Available' : 'Unavailable'} aria-label={product.available ? 'Available' : 'Unavailable'}>
              <PackageCheck size={12} />
              {product.available ? 'Stock' : 'Hold'}
            </span>
          </div>
          <p className="product-composition">{product.composition}</p>
          <div className="product-meta-grid">
            <span>{product.company}</span>
            <span>{product.packing}</span>
            <strong><BadgeIndianRupee size={13} />{formatMrp(product.mrp)}</strong>
          </div>
        </div>
        <div className="product-card-action">
          {cartItem ? (
            <QuantitySelector value={cartItem.quantity} allowZero onChange={(quantity) => updateQuantity(product.id, quantity)} />
          ) : (
            <button className="button primary compact-add" disabled={!product.available} onClick={() => addProduct(product, 1)}>
              <ShoppingCart size={18} />
              Add
            </button>
          )}
        </div>
      </div>
      {relatedProducts.length > 0 ? (
        <div className="related-products-row" aria-label={`Similar ${product.composition} products`}>
          {relatedProducts.map((item) => {
            const relatedCartItem = items.find((cartEntry) => cartEntry.productId === item.id)
            return (
              <article className="related-product-tile" key={item.id}>
                <Link to={`/catalogue/${item.id}`} className="related-product-image-link">
                  <ProductImage src={item.imageUrl} alt={item.name} />
                </Link>
                <span>
                  <strong><Link to={`/catalogue/${item.id}`}>{item.name}</Link></strong>
                  <small>{item.company} - {formatMrp(item.mrp)}</small>
                </span>
                <div className="related-product-action">
                  {relatedCartItem ? (
                    <QuantitySelector value={relatedCartItem.quantity} allowZero onChange={(quantity) => updateQuantity(item.id, quantity)} />
                  ) : (
                    <button className="button primary compact-add" type="button" onClick={() => addProduct(item, 1)}>
                      <ShoppingCart size={14} />
                    </button>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      ) : null}
    </article>
  )
}
