import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Order } from '../types/order'
import { getCustomerOrders } from '../services/orderService'
import { useLaunch } from '../hooks/useLaunch'
import { EmptyState } from '../components/common/EmptyState'
import { ErrorState } from '../components/common/ErrorState'
import { LoadingState } from '../components/common/LoadingState'
import { deliveryLabel, formatDate } from '../utils/formatting'

export function MyOrders() {
  const { uid } = useLaunch()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (!uid) { setLoading(false); return }
    getCustomerOrders(uid).then(setOrders).catch((err: Error) => setError(err.message)).finally(() => setLoading(false))
  }, [uid])
  if (loading) return <LoadingState label="Loading orders" />
  if (error) return <ErrorState message={error} />
  if (orders.length === 0) return <EmptyState title="No orders yet" message="Submitted orders will appear here." />
  return <section className="page-stack"><h1>My Orders</h1><div className="order-list">{orders.map((order) => <article className="order-card" key={order.id}><h2>{order.orderNumber}</h2><p>{formatDate(order.createdAt)} · {order.status}</p><p>{order.totalProducts} products · {order.totalQuantity} qty · {deliveryLabel(order.deliveryPreference)}</p><Link className="button secondary" to={`/orders/${order.id}`}>View details</Link></article>)}</div></section>
}
