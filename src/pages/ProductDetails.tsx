import { ArrowLeft, ShoppingCart } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useState } from 'react'
import { EmptyState } from '../components/common/EmptyState'
import { ProductImage } from '../components/catalogue/ProductImage'
import { QuantitySelector } from '../components/catalogue/QuantitySelector'
import { useCatalogue } from '../hooks/useCatalogue'
import { useCart } from '../hooks/useCart'
import { formatMrp } from '../utils/formatting'

export function ProductDetails() {
  const { id } = useParams()
  const { catalogue } = useCatalogue()
  const { addProduct } = useCart()
  const [quantity, setQuantity] = useState(1)
  const product = catalogue?.products.find((item) => item.id === id)
  if (!product) return <EmptyState title="Product not found" message="This product is not available in the current catalogue." />
  return (
    <section className="details-page">
      <Link className="text-link" to="/catalogue"><ArrowLeft size={17} />Back to catalogue</Link>
      <ProductImage src={product.imageUrl} alt={product.name} />
      <div>
        <span className={product.available ? 'badge success' : 'badge warning'}>{product.available ? 'Available' : 'Unavailable'}</span>
        <h1>{product.name}</h1>
        <p>{product.composition}</p>
        <dl className="details-grid">
          <div><dt>Company</dt><dd>{product.company}</dd></div>
          <div><dt>Category</dt><dd>{product.category}</dd></div>
          <div><dt>Packing</dt><dd>{product.packing}</dd></div>
          <div><dt>MRP</dt><dd>{formatMrp(product.mrp)}</dd></div>
        </dl>
        <p className="rate-note">Final rate and availability will be confirmed by the supplier.</p>
        <div className="card-actions">
          <QuantitySelector value={quantity} onChange={setQuantity} />
          <button className="button primary" disabled={!product.available} onClick={() => addProduct(product, quantity)}><ShoppingCart size={18} />Add to Cart</button>
        </div>
      </div>
    </section>
  )
}
