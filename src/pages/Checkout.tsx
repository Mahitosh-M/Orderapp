import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { Bus, Home, Send, Store } from 'lucide-react'
import { ErrorState } from '../components/common/ErrorState'
import { useCart } from '../hooks/useCart'
import { useCatalogue } from '../hooks/useCatalogue'
import { useLaunch } from '../hooks/useLaunch'
import type { DeliveryPreference } from '../types/order'
import { submitOrder } from '../services/orderService'

const deliveryOptions: Array<{ value: DeliveryPreference; label: string; helper: string; icon: typeof Bus }> = [
  { value: 'bus', label: 'Bus', helper: 'Send by transport', icon: Bus },
  { value: 'home', label: 'Home', helper: 'Deliver to address', icon: Home },
  { value: 'shop', label: 'Shop', helper: 'Pickup from shop', icon: Store },
]

export function Checkout() {
  const { profile: customer } = useLaunch()
  const { items, clearCart } = useCart()
  const { offline } = useCatalogue()
  const [deliveryPreference, setDeliveryPreference] = useState<DeliveryPreference>('bus')
  const [customerNote, setCustomerNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  if (items.length === 0 && !orderId) return <Navigate to="/cart" replace />
  async function placeOrder() {
    if (!customer) return setError('Customer name is required before submitting an order.')
    if (offline) return setError('You are offline. Your cart is saved, but orders can only be submitted when internet is available.')
    setSubmitting(true)
    setError(null)
    try {
      const id = await submitOrder(customer, items, { deliveryPreference, customerNote })
      clearCart()
      setOrderId(id)
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Order submission failed. Your cart is unchanged.')
    } finally {
      setSubmitting(false)
    }
  }
  if (orderId) {
    return <section className="success-panel"><h1>Order submitted</h1><p>Your order was submitted successfully.</p><Link className="button primary" to={`/orders/${orderId}`}>View Order</Link><Link className="button secondary" to="/catalogue">Continue Shopping</Link></section>
  }
  return (
    <section className="page-stack">
      <div className="form-panel">
        <h1>Checkout</h1>
        {offline && <ErrorState message="You are offline. Your cart is saved, but orders can only be submitted when internet is available." />}
        {error && <ErrorState message={error} />}
        <div className="delivery-choice-group" role="radiogroup" aria-label="Delivery preference">
          {deliveryOptions.map(({ value, label, helper, icon: Icon }) => (
            <button
              className={`delivery-choice ${deliveryPreference === value ? 'active' : ''}`}
              type="button"
              role="radio"
              aria-checked={deliveryPreference === value}
              key={value}
              onClick={() => setDeliveryPreference(value)}
            >
              <span className={`delivery-icon ${value}`}><Icon size={20} /></span>
              <span>
                <strong>{label}</strong>
                <small>{helper}</small>
              </span>
            </button>
          ))}
        </div>
        <label>Order note<textarea value={customerNote} maxLength={500} onChange={(event) => setCustomerNote(event.target.value)} /></label>
        <p className="rate-note">Final rates, stock availability, schemes and delivery time will be confirmed by the supplier.</p>
        <button className="button primary" disabled={submitting || offline} onClick={() => void placeOrder()}><Send size={18} />{submitting ? 'Submitting...' : 'Submit order'}</button>
      </div>
    </section>
  )
}
