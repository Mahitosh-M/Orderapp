import type { Timestamp } from 'firebase/firestore'

export function formatMrp(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatDate(value?: string | Date | Timestamp) {
  if (!value) return 'Not available'
  const date = typeof value === 'string' ? new Date(value) : value instanceof Date ? value : value.toDate()
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export function deliveryLabel(value: string) {
  if (value === 'urgent') return 'Urgent'
  if (value === 'pickup') return 'Customer pickup'
  return 'Normal delivery'
}
