import type { Timestamp } from 'firebase/firestore'

export interface CartItem {
  productId: string
  productName: string
  composition: string
  company: string
  category: string
  packing: string
  mrp: number
  imageUrl: string
  quantity: number
}

export type OrderItem = CartItem

export type DeliveryPreference = 'bus' | 'home' | 'shop'

export type OrderStatus =
  | 'submitted'
  | 'confirmed'
  | 'processing'
  | 'dispatched'
  | 'delivered'
  | 'cancelled'

export interface Order {
  id: string
  orderNumber: string
  customerId: string
  customerCode: string
  customerName: string
  customerMobile: string
  deliveryAddress: string
  deliveryPreference: DeliveryPreference
  status: OrderStatus
  items: OrderItem[]
  totalProducts: number
  totalQuantity: number
  customerNote: string
  adminNote: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface OrderDraft {
  deliveryPreference: DeliveryPreference
  customerNote: string
}
