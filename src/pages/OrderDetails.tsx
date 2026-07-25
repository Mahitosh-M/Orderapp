import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Order } from '../types/order'
import { getOrder } from '../services/orderService'
import { EmptyState } from '../components/common/EmptyState'
import { ErrorState } from '../components/common/ErrorState'
import { LoadingState } from '../components/common/LoadingState'
import { deliveryLabel, formatDate } from '../utils/formatting'
import { useCatalogue } from '../hooks/useCatalogue'
import { useCart } from '../hooks/useCart'

export function OrderDetails() {
  const { id } = useParams()
  const { catalogue } = useCatalogue()
  const { addProduct } = useCart()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reorderMessage, setReorderMessage] = useState<string | null>(null)
  useEffect(() => {
    if (!id) return
    getOrder(id).then(setOrder).catch((err: Error) => setError(err.message)).finally(() => setLoading(false))
  }, [id])
  if (loading) return <LoadingState label="Loading order" />
  if (error) return <ErrorState message={error} />
  if (!order) return <EmptyState title="Order not found" message="The order could not be loaded." />
  function reorder() {
    if (!order || !catalogue) return
    const unavailable: string[] = []
    for (const item of order.items) {
      const currentProduct = catalogue.products.find((product) => product.id === item.productId)
      if (!currentProduct || !currentProduct.available) {
        unavailable.push(item.productName)
        continue
      }
      addProduct(currentProduct, item.quantity)
    }
    setReorderMessage(
      unavailable.length > 0
        ? `Available items were added. Removed or unavailable products skipped: ${unavailable.join(', ')}.`
        : 'Items were added to cart using current catalogue details. Review quantities before checkout.',
    )
  }
  return (
    <section className="page-stack">
      <Link className="text-link" to="/orders">Back to orders</Link>
      <article className="form-panel print-area">
        <h1>{order.orderNumber}</h1>
        <p>Status: <strong>{order.status}</strong></p>
        <p>{formatDate(order.createdAt)} · Updated {formatDate(order.updatedAt)}</p>
        <p>{deliveryLabel(order.deliveryPreference)} · {order.deliveryAddress}</p>
        <div className="timeline">{['pending', 'confirmed'].map((status) => <span className={status === order.status ? 'active' : ''} key={status}>{status}</span>)}</div>
        {reorderMessage && <p className="rate-note">{reorderMessage}</p>}
        <button className="button secondary" onClick={reorder}>Reorder to cart</button>
        <h2>Items</h2>
        {order.items.map((item) => <div className="line-item" key={item.productId}><span>{item.productName}<small>{item.company} · {item.packing}</small></span><strong>{item.quantity}</strong></div>)}
        {order.customerNote && <p><strong>Customer note:</strong> {order.customerNote}</p>}
        {order.adminNote && <p><strong>Supplier note:</strong> {order.adminNote}</p>}
      </article>
    </section>
  )
}
