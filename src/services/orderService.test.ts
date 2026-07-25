import { describe, expect, it } from 'vitest'
import { createOrderPayload } from './orderService'
import type { CustomerProfile } from '../types/customer'
import type { CartItem } from '../types/order'

const customer: CustomerProfile = {
  uid: 'u1',
  customerCode: 'C001',
  businessName: 'Sample Medical',
  ownerName: 'Owner',
  mobile: '9999999999',
  email: 'sample@example.com',
  address: 'Sample address',
  active: true,
  role: 'customer',
  createdAt: '',
  updatedAt: '',
}

const item: CartItem = { productId: 'P1', productName: 'Public Product', composition: 'Comp', company: 'Co', category: 'Cat', packing: 'Pack', mrp: 10, imageUrl: '', quantity: 3 }

describe('order payload creation', () => {
  it('creates a customer-owned submitted order snapshot without selling price fields', () => {
    const payload = createOrderPayload(customer, [item], { deliveryPreference: 'normal', customerNote: 'Please send tomorrow' })
    expect(payload.customerId).toBe('u1')
    expect(payload.status).toBe('submitted')
    expect(payload.totalProducts).toBe(1)
    expect(payload.totalQuantity).toBe(3)
    expect(JSON.stringify(payload)).not.toContain('sellingPrice')
  })

  it('prevents offline/empty style invalid payloads by rejecting empty cart', () => {
    expect(() => createOrderPayload(customer, [], { deliveryPreference: 'normal', customerNote: '' })).toThrow('cart is empty')
  })
})
