import { useEffect, useState } from 'react'
import { Clock3, PackageCheck, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Order } from '../types/order'
import { getCustomerOrders } from '../services/orderService'
import { useLaunch } from '../hooks/useLaunch'
import { EmptyState } from '../components/common/EmptyState'
import { ErrorState } from '../components/common/ErrorState'
import { LoadingState } from '../components/common/LoadingState'
import { deliveryLabel, formatDate } from '../utils/formatting'

export function MyOrders() {
  const { customerId } = useLaunch()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!customerId) { setLoading(false); return }
    getCustomerOrders(customerId).then(setOrders).catch((err: Error) => setError(err.message)).finally(() => setLoading(false))
  }, [customerId])

  if (loading) return <LoadingState label="Loading orders" />
  if (error) return <ErrorState message={error} />
  if (orders.length === 0) return <EmptyState title="No orders yet" message="Submitted orders will appear here." />

  return (
    <section className="page-stack">
      <h1>My Orders</h1>
      <div className="order-list">
        {orders.map((order) => (
          <article className="order-card my-order-card" key={order.id}>
            <div className="my-order-card-head">
              <span className="my-order-icon"><ShoppingBag size={20} /></span>
              <div>
                <h2>{order.orderNumber}</h2>
                <p><Clock3 size={13} />{formatDate(order.createdAt)}</p>
              </div>
            </div>
            <div className="my-order-meta">
              <span><PackageCheck size={13} />{order.status}</span>
              <span>{order.totalProducts} products</span>
              <span>{order.totalQuantity} qty</span>
              <span>{deliveryLabel(order.deliveryPreference)}</span>
            </div>
            <Link className="button primary compact-button" to={`/orders/${order.id}`}>View details</Link>
          </article>
        ))}
      </div>
    </section>
  )
}
