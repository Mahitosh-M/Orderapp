import { Minus, Plus } from 'lucide-react'
import { MAX_CART_QUANTITY } from '../../utils/constants'

export function QuantitySelector({
  value,
  onChange,
  allowZero = false,
}: {
  value: number
  onChange: (value: number) => void
  allowZero?: boolean
}) {
  const minValue = allowZero ? 0 : 1

  return (
    <div className="quantity-selector">
      <button title="Decrease quantity" aria-label="Decrease quantity" onClick={() => onChange(Math.max(minValue, value - 1))}>
        <Minus size={16} />
      </button>
      <input aria-label="Quantity" value={value} inputMode="numeric" onChange={(event) => onChange(Math.max(minValue, Math.min(MAX_CART_QUANTITY, Number(event.target.value) || minValue)))} />
      <button title="Increase quantity" aria-label="Increase quantity" onClick={() => onChange(Math.min(MAX_CART_QUANTITY, value + 1))}>
        <Plus size={16} />
      </button>
    </div>
  )
}
