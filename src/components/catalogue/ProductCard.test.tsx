vi.mock('../../services/productImageService', () => ({ loadProductImage: () => Promise.resolve(null) }))
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import type { Product } from '../../types/product'
import type { CartItem } from '../../types/order'

const mocks = vi.hoisted(() => ({ products: [] as Product[], items: [] as CartItem[], addProduct: vi.fn(), updateQuantity: vi.fn() }))
vi.mock('../../hooks/useCatalogue', () => ({ useCatalogue: () => ({ catalogue: { products: mocks.products } }) }))
vi.mock('../../hooks/useCart', () => ({ useCart: () => mocks }))
import { ProductCard } from './ProductCard'

const product: Product = { id: 'base', name: 'Base medicine', composition: 'Same composition', company: 'Example', category: 'Category', packing: '10 tablets', mrp: 100, imageUrl: '', available: true }
const similar = { ...product, id: 'similar', name: 'Similar medicine' }
const third = { ...product, id: 'third', name: 'Another medicine' }
const selected = { ...product, id: 'selected', name: 'Already selected medicine' }
const cartEntry = (item: Product): CartItem => ({ ...item, productId: item.id, productName: item.name, quantity: 2 })
const showProduct = () => render(<MemoryRouter><ProductCard product={product} /></MemoryRouter>)

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }))
  mocks.items = [cartEntry(selected)]
  mocks.products = [product, similar, third, selected, { ...product, id: 'hold', name: 'Unavailable medicine', available: false }, { ...product, id: 'different', name: 'Different medicine', composition: 'Different' }]
})
afterEach(() => { cleanup(); vi.unstubAllGlobals() })

it('opens matching alternatives beneath a clicked tile without adding anything', async () => {
  const user = userEvent.setup()
  showProduct()
  expect(screen.queryByRole('region', { name: 'Similar products for Base medicine' })).not.toBeInTheDocument()
  await user.click(within(screen.getByRole('group', { name: product.name })).getByText(product.composition))
  const region = screen.getByRole('region', { name: 'Similar products for Base medicine' })
  expect(within(region).getByRole('group', { name: similar.name })).toBeInTheDocument()
  for (const name of ['Already selected medicine', 'Unavailable medicine', 'Different medicine']) expect(within(region).queryByRole('group', { name })).not.toBeInTheDocument()
  expect(mocks.addProduct).not.toHaveBeenCalled()
  expect(mocks.updateQuantity).not.toHaveBeenCalled()
  expect(within(screen.getByRole('group', { name: product.name })).getByRole('link', { name: 'Details' })).toHaveAttribute('href', '/catalogue/base')
})

it('allows keyboard selection and closing from the product title', async () => {
  const user = userEvent.setup()
  showProduct()
  const title = screen.getByRole('button', { name: product.name })
  title.focus()
  await user.keyboard('{Enter}')
  expect(title).toHaveAttribute('aria-expanded', 'true')
  await user.keyboard('{Enter}')
  expect(title).toHaveAttribute('aria-expanded', 'false')
  expect(screen.queryByRole('region', { name: 'Similar products for Base medicine' })).not.toBeInTheDocument()
})

it('lets a suggested tile reveal its own alternatives without repeating ancestors', async () => {
  const user = userEvent.setup()
  showProduct()
  await user.click(screen.getByRole('button', { name: 'Show similar products for Base medicine' }))
  const parent = screen.getByRole('region', { name: 'Similar products for Base medicine' })
  await user.click(within(parent).getByRole('button', { name: similar.name }))
  const nested = within(parent).getByRole('region', { name: 'Similar products for Similar medicine' })
  expect(within(nested).getByRole('group', { name: third.name })).toBeInTheDocument()
  expect(within(nested).queryByRole('group', { name: product.name })).not.toBeInTheDocument()
  expect(mocks.addProduct).not.toHaveBeenCalled()
})

it('keeps Add working and opens alternatives after adding', async () => {
  const user = userEvent.setup()
  showProduct()
  await user.click(screen.getByRole('button', { name: 'Add Base medicine to cart' }))
  expect(mocks.addProduct).toHaveBeenCalledExactlyOnceWith(product, 1)
  expect(screen.getByRole('region', { name: 'Similar products for Base medicine' })).toBeInTheDocument()
})

it('keeps quantity changes separate from selecting the tile', async () => {
  const user = userEvent.setup()
  mocks.items = [cartEntry(product)]
  showProduct()
  await user.click(screen.getByRole('button', { name: 'Increase quantity' }))
  expect(mocks.updateQuantity).toHaveBeenCalledExactlyOnceWith(product.id, 3)
  expect(screen.queryByRole('region', { name: 'Similar products for Base medicine' })).not.toBeInTheDocument()
})

it('shows a clear empty state when a clicked product has no alternatives', async () => {
  const user = userEvent.setup()
  mocks.products = [product]
  showProduct()
  await user.click(screen.getByRole('button', { name: product.name }))
  expect(screen.getByText('No similar products available.')).toBeInTheDocument()
})
