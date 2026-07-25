import { Trash2 } from 'lucide-react'
import type { CartItem } from '../../types/order'
import { formatMrp } from '../../utils/formatting'
import { ProductImage } from '../catalogue/ProductImage'
import { QuantitySelector } from '../catalogue/QuantitySelector'
import { useCart } from '../../hooks/useCart'

export function CartItemCard({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart()
  return (
    <article className="cart-item">
      <ProductImage src={item.imageUrl} alt={item.productName} />
      <div>
        <h3>{item.productName}</h3>
        <p>{item.composition}</p>
        <p>{item.company} · {item.packing}</p>
        <strong>MRP reference {formatMrp(item.mrp)}</strong>
        <div className="card-actions">
          <QuantitySelector value={item.quantity} onChange={(value) => updateQuantity(item.productId, value)} />
          <button title="Remove item" aria-label={`Remove ${item.productName}`} className="icon-button danger-text" onClick={() => removeItem(item.productId)}>
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </article>
  )
}
