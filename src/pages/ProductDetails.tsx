import { ArrowLeft, ShoppingCart } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { EmptyState } from '../components/common/EmptyState'
import { ProductImage } from '../components/catalogue/ProductImage'
import { QuantitySelector } from '../components/catalogue/QuantitySelector'
import { useCatalogue } from '../hooks/useCatalogue'
import { useCart } from '../hooks/useCart'
import { formatMrp } from '../utils/formatting'

export function ProductDetails() {
  const { id } = useParams()
  const { catalogue } = useCatalogue()
  const { addProduct, items, updateQuantity } = useCart()
  const product = catalogue?.products.find((item) => item.id === id)
  if (!product) return <EmptyState title="Product not found" message="This product is not available in the current catalogue." />
  const cartItem = items.find((item) => item.productId === product.id)
  return (
    <section className="details-page">
      <Link className="text-link" to="/catalogue"><ArrowLeft size={17} />Back to catalogue</Link>
      <article className="product-card product-detail-card">
        <div className="product-detail-media">
          <ProductImage src={product.imageUrl} alt={product.name} />
        </div>
        <div className="product-copy">
          <div className="product-info">
            <div className="product-title-row">
              <h1>{product.name}</h1>
            </div>
            <dl className="details-grid">
              <div><dt>Company</dt><dd>{product.company}</dd></div>
              <div><dt>Packing</dt><dd>{product.packing}</dd></div>
              <div><dt>MRP</dt><dd>{formatMrp(product.mrp)}</dd></div>
            </dl>
            <p className="product-composition">{product.composition}</p>
          </div>
          <div className="product-card-action">
            {cartItem ? (
              <QuantitySelector value={cartItem.quantity} allowZero onChange={(quantity) => updateQuantity(product.id, quantity)} />
            ) : (
              <button className="button primary compact-add" disabled={!product.available} onClick={() => addProduct(product, 1)}><ShoppingCart size={18} />Add to Cart</button>
            )}
          </div>
        </div>
      </article>
    </section>
  )
}
