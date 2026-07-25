import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { Send } from 'lucide-react'
import { CartSummary } from '../components/cart/CartSummary'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { ErrorState } from '../components/common/ErrorState'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { useCatalogue } from '../hooks/useCatalogue'
import type { DeliveryPreference } from '../types/order'
import { submitOrder } from '../services/orderService'

export function Checkout() {
  const { customer } = useAuth()
  const { items, clearCart } = useCart()
  const { offline } = useCatalogue()
  const [deliveryPreference, setDeliveryPreference] = useState<DeliveryPreference>('normal')
  const [customerNote, setCustomerNote] = useState('')
  const [confirm, setConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  if (items.length === 0 && !orderId) return <Navigate to="/cart" replace />
  async function placeOrder() {
    if (!customer) return setError('Please sign in before submitting an order.')
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
      setConfirm(false)
    }
  }
  if (orderId) {
    return <section className="success-panel"><h1>Order submitted</h1><p>Your order was submitted successfully.</p><Link className="button primary" to={`/orders/${orderId}`}>View Order</Link><Link className="button secondary" to="/catalogue">Continue Shopping</Link></section>
  }
  return (
    <section className="page-stack two-column">
      <div className="form-panel">
        <h1>Checkout</h1>
        {offline && <ErrorState message="You are offline. Your cart is saved, but orders can only be submitted when internet is available." />}
        {error && <ErrorState message={error} />}
        <dl className="details-grid">
          <div><dt>Business</dt><dd>{customer?.businessName ?? 'Sign in required'}</dd></div>
          <div><dt>Delivery address</dt><dd>{customer?.address ?? 'Not available'}</dd></div>
          <div><dt>Mobile</dt><dd>{customer?.mobile ?? 'Not available'}</dd></div>
        </dl>
        <label>Delivery preference<select value={deliveryPreference} onChange={(event) => setDeliveryPreference(event.target.value as DeliveryPreference)}><option value="normal">Normal delivery</option><option value="urgent">Urgent</option><option value="pickup">Customer pickup</option></select></label>
        <label>Order note<textarea value={customerNote} maxLength={500} onChange={(event) => setCustomerNote(event.target.value)} /></label>
        <p className="rate-note">Final rates, stock availability, schemes and delivery time will be confirmed by the supplier.</p>
        <button className="button primary" disabled={submitting || offline || !customer} onClick={() => setConfirm(true)}><Send size={18} />Submit order</button>
      </div>
      <CartSummary />
      <ConfirmDialog open={confirm} title="Submit order?" message="Please confirm quantities and delivery details before submission." confirmLabel={submitting ? 'Submitting...' : 'Submit'} onCancel={() => setConfirm(false)} onConfirm={() => void placeOrder()} />
    </section>
  )
}
