import { Navigate, Route, Routes } from 'react-router-dom'
import { CustomerLayout } from './components/layout/CustomerLayout'
import { Catalogue } from './pages/Catalogue'
import { CategoryCompositions } from './pages/CategoryCompositions'
import { ProductDetails } from './pages/ProductDetails'
import { Cart } from './pages/Cart'
import { Checkout } from './pages/Checkout'
import { MyOrders } from './pages/MyOrders'
import { OrderDetails } from './pages/OrderDetails'
import { InstallApp } from './pages/InstallApp'
import { NotFound } from './pages/NotFound'
import { StaffOrders } from './pages/staff/StaffOrders'
import { useLaunch } from './hooks/useLaunch'
import { LoadingState } from './components/common/LoadingState'

export function App() {
  const { isStaff, loading } = useLaunch()

  if (loading) return <LoadingState label="Loading customer" />

  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        {isStaff ? (
          <>
            <Route index element={<Navigate to="/staff/orders" replace />} />
            <Route path="staff" element={<Navigate to="/staff/orders" replace />} />
            <Route path="staff/orders" element={<StaffOrders />} />
            <Route path="*" element={<Navigate to="/staff/orders" replace />} />
          </>
        ) : (
          <>
            <Route index element={<Catalogue />} />
            <Route path="categories" element={<Navigate to="/" replace />} />
            <Route path="categories/:category" element={<CategoryCompositions />} />
            <Route path="catalogue" element={<Catalogue />} />
            <Route path="catalogue/:id" element={<ProductDetails />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="orders" element={<MyOrders />} />
            <Route path="orders/:id" element={<OrderDetails />} />
            <Route path="install" element={<InstallApp />} />
            <Route path="offers" element={<Navigate to="/" replace />} />
            <Route path="profile" element={<Navigate to="/" replace />} />
            <Route path="staff/*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Route>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
