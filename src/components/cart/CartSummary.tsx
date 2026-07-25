import { formatMrp } from '../../utils/formatting'
import { useCart } from '../../hooks/useCart'

export function CartSummary() {
  const { items, totalProducts, totalQuantity } = useCart()
  const mrpTotal = items.reduce((sum, item) => sum + item.mrp * item.quantity, 0)
  return (
    <aside className="summary-panel">
      <h2>Cart summary</h2>
      <p><span>Distinct products</span><strong>{totalProducts}</strong></p>
      <p><span>Total quantity</span><strong>{totalQuantity}</strong></p>
      <p><span>Total MRP reference</span><strong>{formatMrp(mrpTotal)}</strong></p>
      <small>Final rates, stock availability, schemes and delivery time will be confirmed by the supplier.</small>
    </aside>
  )
}
