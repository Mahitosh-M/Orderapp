import { useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Product } from '../../types/product'
import { formatMrp } from '../../utils/formatting'
import { useCart } from '../../hooks/useCart'
import { ProductImage } from './ProductImage'
import { QuantitySelector } from './QuantitySelector'

export function ProductCard({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1)
  const { addProduct } = useCart()
  return (
    <article className="product-card">
      <Link to={`/catalogue/${product.id}`} className="product-link">
        <ProductImage src={product.imageUrl} alt={product.name} />
      </Link>
      <div className="product-copy">
        <div className="product-title-row">
          <h3><Link to={`/catalogue/${product.id}`}>{product.name}</Link></h3>
          <span className={product.available ? 'badge success' : 'badge warning'}>{product.available ? 'Available' : 'Unavailable'}</span>
        </div>
        <p>{product.composition}</p>
        <dl>
          <div><dt>Company</dt><dd>{product.company}</dd></div>
          <div><dt>Packing</dt><dd>{product.packing}</dd></div>
          <div><dt>MRP</dt><dd>{formatMrp(product.mrp)}</dd></div>
        </dl>
        <p className="rate-note">Final rate and availability will be confirmed by the supplier.</p>
        <div className="card-actions">
          <QuantitySelector value={quantity} onChange={setQuantity} />
          <button className="button primary" disabled={!product.available} onClick={() => addProduct(product, quantity)}>
            <ShoppingCart size={18} />
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  )
}
