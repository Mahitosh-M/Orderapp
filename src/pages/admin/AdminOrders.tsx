import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Order, OrderStatus } from '../../types/order'
import { getAdminOrders } from '../../services/orderService'
import { LoadingState } from '../../components/common/LoadingState'
import { ErrorState } from '../../components/common/ErrorState'

const statuses: Array<OrderStatus | ''> = ['', 'submitted', 'confirmed', 'processing', 'dispatched', 'delivered', 'cancelled']

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [status, setStatus] = useState<OrderStatus | ''>('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => { setLoading(true); getAdminOrders(status || undefined).then(setOrders).catch((err: Error) => setError(err.message)).finally(() => setLoading(false)) }, [status])
  const filtered = useMemo(() => orders.filter((order) => [order.orderNumber, order.customerName, order.customerCode, order.customerMobile].join(' ').toLowerCase().includes(search.toLowerCase())), [orders, search])
  if (loading) return <LoadingState label="Loading admin orders" />
  return <section className="page-stack"><h1>Admin Orders</h1>{error && <ErrorState message={error} />}<div className="filter-grid"><label>Status<select value={status} onChange={(event) => setStatus(event.target.value as OrderStatus | '')}>{statuses.map((item) => <option key={item || 'all'} value={item}>{item || 'All statuses'}</option>)}</select></label><label>Search<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Order, customer, code, mobile" /></label></div><div className="order-list">{filtered.map((order) => <article className="order-card" key={order.id}><h2>{order.orderNumber}</h2><p>{order.customerName} · {order.customerMobile}</p><p>{order.status} · {order.totalQuantity} qty</p><Link className="button secondary" to={`/admin/orders/${order.id}`}>Open</Link></article>)}</div></section>
}
