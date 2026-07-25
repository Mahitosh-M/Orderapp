import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { ProtectedRoute } from './ProtectedRoute'

vi.mock('../../services/firebase', () => ({ isFirebaseConfigured: () => true }))
vi.mock('../../hooks/useAuth', () => ({ useAuth: () => ({ user: null, customer: null, loading: false, isAdmin: false, isCustomer: false }) }))

describe('protected routes', () => {
  it('redirects unauthenticated customers to login', async () => {
    render(<MemoryRouter initialEntries={['/orders']}><Routes><Route path="/login" element={<span>login</span>} /><Route element={<ProtectedRoute />}><Route path="/orders" element={<span>orders</span>} /></Route></Routes></MemoryRouter>)
    expect(await screen.findByText('login')).toBeInTheDocument()
  })
})
