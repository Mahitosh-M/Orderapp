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
          <span className={product.available ? 'stock-dot success' : 'stock-dot warning'} title={product.available ? 'Available' : 'Unavailable'} aria-label={product.available ? 'Available' : 'Unavailable'} />
        </div>
        <p className="product-composition">{product.composition}</p>
        <p className="product-meta">{product.company} · {product.packing} · MRP {formatMrp(product.mrp)}</p>
        <div className="card-actions">
          <QuantitySelector value={quantity} onChange={setQuantity} />
          <button className="button primary compact-add" disabled={!product.available} onClick={() => addProduct(product, quantity)}>
            <ShoppingCart size={18} />
            Add
          </button>
        </div>
      </div>
    </article>
  )
}
