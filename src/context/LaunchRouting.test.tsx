import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { BrowserRouter, Outlet, useLocation } from 'react-router-dom'
import { LaunchProvider } from './LaunchContext'
import { useLaunch } from '../hooks/useLaunch'
import { App } from '../App'
const homeRender = vi.hoisted(() => vi.fn())
vi.mock('../pages/Home', () => ({ Home: () => { homeRender(); return <h1>Customer Home</h1> } }))
vi.mock('../pages/staff/StaffOrders', () => ({ StaffOrders: () => <h1>Staff Orders</h1> }))
vi.mock('../pages/admin/CategoryImages', () => ({ CategoryImages: () => <h1>Admin</h1> }))
vi.mock('../components/layout/CustomerLayout', () => ({ CustomerLayout: () => <Outlet /> }))
function Probe() {
  const { loading, role, error } = useLaunch()
  const { pathname, search } = useLocation()
  return <output data-testid="launch">{JSON.stringify({ loading, role, error, pathname, search })}</output>
}
function open(path: string) {
  window.history.replaceState(null, '', path)
  return render(<BrowserRouter><LaunchProvider><Probe /><App /></LaunchProvider></BrowserRouter>)
}
function store(role: 'staff' | 'customer') {
  window.sessionStorage.setItem('partner-order-launch-session', JSON.stringify({ uid: 'saved', customerId: 'saved', customerName: 'Saved user', customerArea: '', role, returnUrl: 'https://cisapp-236ab.web.app/orders', profile: { customerCode: 'saved', area: '', role } }))
}
beforeEach(() => { window.sessionStorage.clear(); homeRender.mockClear() })
afterEach(() => { cleanup(); vi.restoreAllMocks(); window.sessionStorage.clear(); window.history.replaceState(null, '', '/') })
describe('Orderapp launch routing', () => {
  it('opens a fresh Staff link directly in Staff Orders and preserves the selected order', async () => {
    open('/staff/orders?name=staff&role=staff&orderId=fixture-order&returnUrl=https%3A%2F%2Fcisapp-236ab.web.app%2Forders')
    await screen.findByRole('heading', { name: 'Staff Orders' })
    expect(window.location.pathname).toBe('/staff/orders')
    expect(new URLSearchParams(window.location.search).get('orderId')).toBe('fixture-order')
    expect(homeRender).not.toHaveBeenCalled()
  })
  it('prioritizes a new Staff launch over a copied customer session', async () => {
    store('customer')
    open('/staff/orders?name=staff&role=STAFF')
    await screen.findByRole('heading', { name: 'Staff Orders' })
    expect(homeRender).not.toHaveBeenCalled()
    expect(JSON.parse(window.sessionStorage.getItem('partner-order-launch-session')!).role).toBe('staff')
  })
  it('restores a saved Staff session without getting stuck loading', async () => {
    store('staff'); open('/staff/orders')
    await screen.findByRole('heading', { name: 'Staff Orders' })
    expect(screen.getByTestId('launch').textContent).toContain('"loading":false')
  })
  it.each(['customer', 'Medical'])('keeps %s launches on the customer Home page', async role => {
    open('/?name=Fixture&role=' + role)
    await screen.findByRole('heading', { name: 'Customer Home' })
    expect(screen.queryByRole('heading', { name: 'Staff Orders' })).toBeNull()
  })
  it('opens Home without launch parameters or storage', async () => {
    open('/'); await screen.findByRole('heading', { name: 'Customer Home' })
    expect(screen.getByTestId('launch').textContent).toContain('"loading":false')
  })
  it('finishes loading after an incomplete launch without treating it as Staff', async () => {
    open('/?role=staff'); await screen.findByRole('heading', { name: 'Customer Home' })
    expect(screen.getByTestId('launch').textContent).toContain('Missing name or role')
  })
  it('opens the Staff page even if session storage cannot be written', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Storage blocked') })
    open('/staff/orders?name=staff&role=staff')
    await screen.findByRole('heading', { name: 'Staff Orders' })
  })
})