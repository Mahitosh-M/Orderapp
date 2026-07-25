import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { CartItemCard } from '../components/cart/CartItemCard'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { EmptyState } from '../components/common/EmptyState'
import { useCart } from '../hooks/useCart'

export function Cart() {
  const { items, clearCart } = useCart()
  const [confirm, setConfirm] = useState(false)
  if (items.length === 0) return <EmptyState title="Your cart is empty" message="Browse the catalogue and add products to prepare an order." />
  return (
    <section className="page-stack">
      <div>
        <div className="cart-title-actions">
          <div className="page-title-row"><h1>Cart</h1><button className="button secondary" onClick={() => setConfirm(true)}><Trash2 size={17} />Clear cart</button></div>
          <Link className="button primary wide" to="/checkout">Proceed to checkout</Link>
        </div>
        <div className="cart-list">{items.map((item) => <CartItemCard key={item.productId} item={item} />)}</div>
      </div>
      <ConfirmDialog open={confirm} title="Clear cart?" message="This removes all products from your cart." confirmLabel="Clear cart" onCancel={() => setConfirm(false)} onConfirm={() => { clearCart(); setConfirm(false) }} />
    </section>
  )
}
