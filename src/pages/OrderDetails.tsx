import { useEffect, useState } from 'react'
import { Clock3, PackageCheck, ShoppingBag, Truck } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import type { Order, OrderItem } from '../types/order'
import { getOrder } from '../services/orderService'
import { EmptyState } from '../components/common/EmptyState'
import { ErrorState } from '../components/common/ErrorState'
import { LoadingState } from '../components/common/LoadingState'
import { deliveryLabel, formatDate } from '../utils/formatting'

function quantityStatus(item: OrderItem) {
  const requested = item.requestedQuantity ?? item.quantity
  if (item.quantity < requested) return 'reduced'
  return 'confirmed'
}

export function OrderDetails() {
  const { id } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (!id) return
    getOrder(id).then(setOrder).catch((err: Error) => setError(err.message)).finally(() => setLoading(false))
  }, [id])
  if (loading) return <LoadingState label="Loading order" />
  if (error) return <ErrorState message={error} />
  if (!order) return <EmptyState title="Order not found" message="The order could not be loaded." />

  return (
    <section className="page-stack">
      <Link className="text-link" to="/orders">Back to orders</Link>
      <article className="form-panel order-detail-card print-area">
        <div className="order-detail-head">
          <span className={`my-order-icon status-${order.status}`}><ShoppingBag size={20} /></span>
          <div>
            <h1>Order details</h1>
            <p><Clock3 size={13} />{formatDate(order.createdAt)}</p>
          </div>
        </div>
        <div className="order-detail-meta">
          <span className={`order-status-pill ${order.status}`}><PackageCheck size={14} />{order.status}</span>
          <span><Truck size={13} />{deliveryLabel(order.deliveryPreference)}</span>
          <span>Updated {formatDate(order.updatedAt)}</span>
        </div>
        <div className="timeline">{['pending', 'confirmed'].map((status) => <span className={`${status} ${status === order.status ? 'active' : ''}`} key={status}>{status}</span>)}</div>
        <h2>Items</h2>
        <div className="confirmed-order-items">
          {order.items.map((item) => (
            <div className="line-item order-detail-item" key={item.productId}>
              <span>{item.productName}</span>
              <strong className={`quantity-box ${quantityStatus(item)}`}>{item.quantity}</strong>
            </div>
          ))}
        </div>
        <div className="order-detail-items legacy-order-items">
          {order.items.map((item) => <div className="line-item order-detail-item" key={item.productId}><span>{item.productName}<small>{item.company} · {item.packing}</small></span><strong>{item.quantity}</strong></div>)}
        </div>
        {order.customerNote && <p className="order-note"><strong>Customer note:</strong> {order.customerNote}</p>}
        {order.adminNote && <p className="order-note"><strong>Supplier note:</strong> {order.adminNote}</p>}
      </article>
    </section>
  )

  /*
  return (
    <section className="page-stack">
      <Link className="text-link" to="/orders">Back to orders</Link>
      <article className="form-panel order-detail-card print-area">
        <div className="order-detail-head">
          <span className="my-order-icon"><ShoppingBag size={20} /></span>
          <div>
            <h1>{order.orderNumber}</h1>
            <p><Clock3 size={13} />{formatDate(order.createdAt)}</p>
          </div>
        </div>
        <div className="order-detail-meta">
          <span><PackageCheck size={13} />{order.status}</span>
          <span><Truck size={13} />{deliveryLabel(order.deliveryPreference)}</span>
          <span>Updated {formatDate(order.updatedAt)}</span>
        </div>
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
  */
}
