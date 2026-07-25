import { useEffect, useMemo, useState } from 'react'
import type { CartItem, Order } from '../../types/order'
import {
  deliverStaffOrder,
  getStaffOrders,
  updateStaffOrderItems,
  updateStaffOrderStatus,
} from '../../services/orderService'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import { formatDate } from '../../utils/formatting'

function recalculateItem(items: CartItem[], productId: string, quantity: number) {
  const safeQuantity = Math.max(1, Math.floor(quantity || 1))
  return items.map((item) => (item.productId === productId ? { ...item, quantity: safeQuantity } : item))
}

export function StaffOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [draftItemsByOrder, setDraftItemsByOrder] = useState<Record<string, CartItem[]>>({})
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function loadOrders() {
    try {
      setLoading(true)
      setError(null)
      const nextOrders = await getStaffOrders()
      setOrders(nextOrders)
      setDraftItemsByOrder(Object.fromEntries(nextOrders.map((order) => [order.id, order.items])))
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to load staff orders.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadOrders()
  }, [])

  const totalPending = useMemo(() => orders.filter((order) => order.status === 'pending').length, [orders])

  async function saveItems(order: Order) {
    const items = draftItemsByOrder[order.id] ?? order.items
    setSavingId(order.id)
    try {
      await updateStaffOrderItems(order.id, items)
      await loadOrders()
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to save order items.')
    } finally {
      setSavingId('')
    }
  }

  async function confirmOrder(order: Order) {
    setSavingId(order.id)
    try {
      await updateStaffOrderStatus(order.id, 'confirmed')
      await loadOrders()
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to confirm order.')
    } finally {
      setSavingId('')
    }
  }

  async function deliverOrder(order: Order) {
    setSavingId(order.id)
    try {
      await deliverStaffOrder(order.id)
      await loadOrders()
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to mark order delivered.')
    } finally {
      setSavingId('')
    }
  }

  if (loading) return <LoadingState label="Loading staff orders" />
  if (error) return <ErrorState message={error} />
  if (orders.length === 0) return <EmptyState title="No staff orders" message="Pending and confirmed orders will appear here." />

  return (
    <section className="page-stack">
      <div className="page-title-row catalogue-title-row">
        <div>
          <h1>Staff Orders</h1>
          <p>{totalPending} pending</p>
        </div>
      </div>
      <div className="order-list">
        {orders.map((order) => {
          const draftItems = draftItemsByOrder[order.id] ?? order.items
          return (
            <article className="order-card staff-order-card" key={order.id}>
              <div className="page-title-row">
                <div>
                  <h2>{order.customerName}</h2>
                  <p>{order.orderNumber} · {formatDate(order.createdAt)}</p>
                </div>
                <span className={`badge ${order.status === 'pending' ? 'warning' : 'success'}`}>{order.status}</span>
              </div>
              <div className="staff-order-items">
                {draftItems.map((item) => (
                  <div className="staff-order-item" key={item.productId}>
                    <span>
                      <strong>{item.productName}</strong>
                      <small>{item.company} · {item.composition} · {item.category}</small>
                    </span>
                    <input
                      aria-label={`Quantity for ${item.productName}`}
                      inputMode="numeric"
                      value={item.quantity}
                      onChange={(event) =>
                        setDraftItemsByOrder((current) => ({
                          ...current,
                          [order.id]: recalculateItem(draftItems, item.productId, Number(event.target.value)),
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
              <div className="staff-order-actions">
                <button className="button secondary" disabled={savingId === order.id} onClick={() => void saveItems(order)}>Save edits</button>
                <button className="button primary" disabled={savingId === order.id || order.status === 'confirmed'} onClick={() => void confirmOrder(order)}>Confirm</button>
                <button className="button danger" disabled={savingId === order.id} onClick={() => void deliverOrder(order)}>Delivered</button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
