import { assertUserInput } from '../inputSecurity';
function validateItemFields(items: CartItem[]) {
  for (const item of items) {
    if (!item || typeof item !== 'object' || Object.keys(item).some(key => !['productId','productName','composition','company','category','packing','mrp','imageUrl','quantity','requestedQuantity'].includes(key))) throw new Error('Unsupported order item fields.');
    for (const key of ['productId','productName','composition','company','category','packing','imageUrl'] as const) {
      if (typeof item[key] !== 'string' || item[key].length > (key === 'imageUrl' ? 2048 : 500)) throw new Error('Invalid order item text.');
    }
    if (!item.productId.trim() || !item.productName.trim() || !Number.isFinite(item.mrp) || item.mrp < 0 || item.mrp > 1e8) throw new Error('Invalid product or MRP.');
    if (item.requestedQuantity !== undefined && (!Number.isInteger(item.requestedQuantity) || item.requestedQuantity < 1 || item.requestedQuantity > MAX_CART_QUANTITY)) throw new Error('Invalid requested quantity.');
  }
}

import type { CataloguePayload, Product } from '../types/product'
import type { CartItem } from '../types/order'
import { MAX_CART_QUANTITY } from './constants'

const forbiddenProductFields = ['sellingPrice', 'sellingRate', 'purchasePrice', 'purchaseRate', 'netRate', 'cost', 'margin', 'supplier', 'internalNotes']

export function validateProduct(product: unknown): product is Product {
  if (!product || typeof product !== 'object') return false
  const record = product as Record<string, unknown>
  if (forbiddenProductFields.some((field) => field in record)) return false
  return (
    typeof record.id === 'string' &&
    typeof record.name === 'string' &&
    typeof record.composition === 'string' &&
    typeof record.company === 'string' &&
    typeof record.category === 'string' &&
    typeof record.packing === 'string' &&
    typeof record.mrp === 'number' &&
    typeof record.imageUrl === 'string' &&
    typeof record.available === 'boolean'
  )
}

export function validateCatalogue(payload: unknown): CataloguePayload {
  if (!payload || typeof payload !== 'object') throw new Error('Catalogue file is invalid.')
  const record = payload as Record<string, unknown>
  if (
    typeof record.version !== 'number' ||
    typeof record.publishedAt !== 'string' ||
    !Array.isArray(record.products) ||
    !record.products.every(validateProduct)
  ) {
    throw new Error('Catalogue file does not match the expected format.')
  }
  return record as unknown as CataloguePayload
}

export function hasForbiddenSellingFields(value: unknown) {
  return !!value && typeof value === 'object' && forbiddenProductFields.some((field) => field in (value as Record<string, unknown>))
}

export function validateCartItems(items: CartItem[]) {
  assertUserInput(items);
  if (!Array.isArray(items) || items.length > 100) throw new Error('An order can contain at most 100 products.');
  validateItemFields(items);
  if (items.length === 0) throw new Error('Your cart is empty.')
  for (const item of items) {
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_CART_QUANTITY) {
      throw new Error(`Invalid quantity for ${item.productName}.`)
    }
  }
}

export function validateStaffOrderItems(items: CartItem[]) {
  assertUserInput(items);
  if (!Array.isArray(items) || items.length > 100) throw new Error('An order can contain at most 100 products.');
  validateItemFields(items);
  if (items.length === 0) throw new Error('Order has no items.')
  for (const item of items) {
    if (!Number.isInteger(item.quantity) || item.quantity < 0 || item.quantity > MAX_CART_QUANTITY) {
      throw new Error(`Invalid quantity for ${item.productName}.`)
    }
  }
}
