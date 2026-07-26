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
import { deliveryLabel, formatDate } from '../../utils/formatting'
import { Bus, Home, Store } from 'lucide-react'

function recalculateItem(items: CartItem[], productId: string, quantity: number) {
  const safeQuantity = Math.max(0, Math.floor(Number.isFinite(quantity) ? quantity : 0))
  return items.map((item) => (item.productId === productId ? { ...item, quantity: safeQuantity } : item))
}

function DeliveryIcon({ value }: { value: Order['deliveryPreference'] }) {
  if (value === 'home') return <Home size={13} />
  if (value === 'shop') return <Store size={13} />
  return <Bus size={13} />
}

export function StaffOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [draftItemsByOrder, setDraftItemsByOrder] = useState<Record<string, CartItem[]>>({})
  const [expandedOrderIds, setExpandedOrderIds] = useState<Set<string>>(() => new Set())
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

  function toggleOrder(orderId: string) {
    setExpandedOrderIds((current) => {
      const next = new Set(current)
      if (next.has(orderId)) next.delete(orderId)
      else next.add(orderId)
      return next
    })
  }

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
          const isExpanded = expandedOrderIds.has(order.id)
          return (
            <article
              className={`order-card staff-order-card ${isExpanded ? 'expanded' : ''}`}
              key={order.id}
              onClick={() => toggleOrder(order.id)}
            >
              <div className="page-title-row">
                <div>
                  <h2 className="staff-customer-line">{order.customerName}{order.customerArea ? <span>{order.customerArea}</span> : null}</h2>
                  <p className="staff-order-date">{formatDate(order.createdAt)}</p>
                  <p>{order.orderNumber} · {formatDate(order.createdAt)}</p>
                </div>
                <div className="staff-order-side">
                  <div className="staff-delivery-pill"><DeliveryIcon value={order.deliveryPreference} />{deliveryLabel(order.deliveryPreference)}</div>
                </div>
              </div>
              {isExpanded ? (
                <div className="staff-order-expanded" onClick={(event) => event.stopPropagation()}>
                  <div className="staff-order-items">
                    {draftItems.map((item) => (
                      <div className="staff-order-item" key={item.productId}>
                        <span>
                          <strong>{item.productName}</strong>
                          <small>{item.company} - {item.composition} - {item.packing}</small>
                        </span>
                        <input
                          aria-label={`Quantity for ${item.productName}`}
                          inputMode="numeric"
                          value={item.quantity}
                          onFocus={(event) => event.currentTarget.select()}
                          onChange={(event) =>
                            setDraftItemsByOrder((current) => ({
                              ...current,
                              [order.id]: recalculateItem(draftItems, item.productId, event.target.value.trim() === '' ? 0 : Number(event.target.value)),
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                  <div className="staff-order-actions">
                    <button className="button secondary" disabled={savingId === order.id || order.status === 'confirmed'} onClick={() => void saveItems(order)}>Save edits</button>
                    <button className="button primary" disabled={savingId === order.id || order.status === 'confirmed'} onClick={() => void confirmOrder(order)}>Confirm</button>
                    <button className="button danger" disabled={savingId === order.id} onClick={() => void deliverOrder(order)}>Delivered</button>
                  </div>
                </div>
              ) : null}
            </article>
          )
        })}
      </div>
    </section>
  )
}
