import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import type { CustomerProfile } from '../types/customer'
import type { CartItem, DeliveryPreference, Order, OrderDraft, OrderStatus } from '../types/order'
import { getFirebaseServices } from './firebase'
import { validateCartItems, validateStaffOrderItems } from '../utils/validation'

export function createOrderNumber(date = new Date()) {
  const stamp = date.toISOString().slice(0, 10).replaceAll('-', '')
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `ORD-${stamp}-${suffix}`
}

export function createOrderPayload(customer: CustomerProfile, items: CartItem[], draft: OrderDraft) {
  validateCartItems(items)
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
  return {
    orderNumber: createOrderNumber(),
    customerId: customer.uid,
    customerCode: customer.customerCode,
    customerName: customer.businessName,
    customerMobile: customer.mobile,
    customerArea: customer.area ?? '',
    deliveryAddress: customer.address,
    deliveryPreference: draft.deliveryPreference,
    status: 'pending' as OrderStatus,
    items: items.map((item) => ({ ...item, requestedQuantity: item.requestedQuantity ?? item.quantity })),
    totalProducts: items.length,
    totalQuantity,
    customerNote: draft.customerNote.trim(),
    adminNote: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
}

export async function submitOrder(customer: CustomerProfile, items: CartItem[], draft: OrderDraft) {
  const { db } = getFirebaseServices()
  const reference = await addDoc(collection(db, 'orders'), createOrderPayload(customer, items, draft))
  return reference.id
}

export async function getCustomerOrders(uid: string, count = 20) {
  const { db } = getFirebaseServices()
  const snapshot = await getDocs(query(collection(db, 'orders'), where('customerId', '==', uid), limit(100)))
  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }) as Order)
    .sort((left, right) => right.createdAt.toMillis() - left.createdAt.toMillis())
    .slice(0, count)
}

export async function getRecentOrders(uid: string) {
  return getCustomerOrders(uid, 3)
}

export async function getOrder(id: string) {
  const { db } = getFirebaseServices()
  const snapshot = await getDoc(doc(db, 'orders', id))
  if (!snapshot.exists()) throw new Error('Order not found.')
  return { id: snapshot.id, ...snapshot.data() } as Order
}

export async function getAdminOrders(status?: OrderStatus) {
  const { db } = getFirebaseServices()
  const constraints = status
    ? [where('status', '==', status), orderBy('createdAt', 'desc'), limit(50)]
    : [orderBy('createdAt', 'desc'), limit(50)]
  const snapshot = await getDocs(query(collection(db, 'orders'), ...constraints))
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Order)
}

export async function getStaffOrders() {
  const { db } = getFirebaseServices()
  const snapshot = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(100)))
  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }) as Order)
    .filter((order) => order.status !== 'delivered')
}

export async function updateStaffOrderItems(id: string, items: CartItem[]) {
  validateStaffOrderItems(items)
  const { db } = getFirebaseServices()
  await updateDoc(doc(db, 'orders', id), {
    items: items.map((item) => ({ ...item })),
    totalProducts: items.length,
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    updatedAt: serverTimestamp(),
  })
}

export async function updateStaffOrderStatus(id: string, status: Extract<OrderStatus, 'confirmed'>) {
  const { db } = getFirebaseServices()
  await updateDoc(doc(db, 'orders', id), { status, updatedAt: serverTimestamp() })
}

export async function deliverStaffOrder(id: string) {
  const { db } = getFirebaseServices()
  await deleteDoc(doc(db, 'orders', id))
}

export async function updateAdminOrder(id: string, status: OrderStatus, adminNote: string) {
  const { db } = getFirebaseServices()
  await updateDoc(doc(db, 'orders', id), { status, adminNote, updatedAt: serverTimestamp() })
}

export function deliveryPreferenceValue(value: DeliveryPreference) {
  return value
}
