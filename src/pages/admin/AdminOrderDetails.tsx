import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Order, OrderStatus } from '../../types/order'
import { getOrder, updateAdminOrder } from '../../services/orderService'
import { LoadingState } from '../../components/common/LoadingState'
import { ErrorState } from '../../components/common/ErrorState'

const statuses: OrderStatus[] = ['submitted', 'confirmed', 'processing', 'dispatched', 'delivered', 'cancelled']

export function AdminOrderDetails() {
  const { id } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [status, setStatus] = useState<OrderStatus>('submitted')
  const [adminNote, setAdminNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => { if (!id) return; getOrder(id).then((next) => { setOrder(next); setStatus(next.status); setAdminNote(next.adminNote ?? '') }).catch((err: Error) => setError(err.message)).finally(() => setLoading(false)) }, [id])
  if (loading) return <LoadingState label="Loading order" />
  if (error || !order || !id) return <ErrorState message={error ?? 'Order not found.'} />
  const whatsapp = `https://wa.me/${order.customerMobile.replace(/\D/g, '')}`
  return <section className="page-stack"><Link className="text-link" to="/admin/orders">Back</Link><article className="form-panel print-area"><h1>{order.orderNumber}</h1><p>{order.customerName} · {order.customerCode}</p><p><a href={`tel:${order.customerMobile}`}>{order.customerMobile}</a> · <a href={whatsapp} target="_blank" rel="noreferrer">WhatsApp</a></p><label>Status<select value={status} onChange={(event) => setStatus(event.target.value as OrderStatus)}>{statuses.map((item) => <option key={item}>{item}</option>)}</select></label><label>Admin note<textarea value={adminNote} onChange={(event) => setAdminNote(event.target.value)} /></label><button className="button primary" onClick={() => void updateAdminOrder(id, status, adminNote)}>Save admin update</button><button className="button secondary" onClick={() => window.print()}>Print</button>{order.customerNote && <p><strong>Customer note:</strong> {order.customerNote}</p>}{order.items.map((item) => <div className="line-item" key={item.productId}><span>{item.productName}<small>{item.company} · {item.packing}</small></span><strong>{item.quantity}</strong></div>)}</article></section>
}
