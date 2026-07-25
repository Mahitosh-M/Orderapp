import { Navigate, Route, Routes } from 'react-router-dom'
import { CustomerLayout } from './components/layout/CustomerLayout'
import { Home } from './pages/Home'
import { Catalogue } from './pages/Catalogue'
import { ProductDetails } from './pages/ProductDetails'
import { Cart } from './pages/Cart'
import { Checkout } from './pages/Checkout'
import { MyOrders } from './pages/MyOrders'
import { OrderDetails } from './pages/OrderDetails'
import { Offers } from './pages/Offers'
import { Profile } from './pages/Profile'
import { InstallApp } from './pages/InstallApp'
import { NotFound } from './pages/NotFound'
import { AdminOrders } from './pages/admin/AdminOrders'
import { AdminOrderDetails } from './pages/admin/AdminOrderDetails'
import { useLaunch } from './hooks/useLaunch'

export function App() {
  const { isAdmin } = useLaunch()

  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        {isAdmin ? (
          <>
            <Route index element={<Navigate to="/admin/orders" replace />} />
            <Route path="admin" element={<Navigate to="/admin/orders" replace />} />
            <Route path="admin/orders" element={<AdminOrders />} />
            <Route path="admin/orders/:id" element={<AdminOrderDetails />} />
            <Route path="*" element={<Navigate to="/admin/orders" replace />} />
          </>
        ) : (
          <>
            <Route index element={<Home />} />
            <Route path="catalogue" element={<Catalogue />} />
            <Route path="catalogue/:id" element={<ProductDetails />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="orders" element={<MyOrders />} />
            <Route path="orders/:id" element={<OrderDetails />} />
            <Route path="offers" element={<Offers />} />
            <Route path="profile" element={<Profile />} />
            <Route path="install" element={<InstallApp />} />
            <Route path="admin/*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Route>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
