import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { CatalogueProvider } from './context/CatalogueContext'
import { LaunchProvider } from './context/LaunchContext'
import { ToastProvider } from './context/ToastContext'
import { App } from './App'
import './styles/global.css'
import './styles/components.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <LaunchProvider>
            <CatalogueProvider>
              <CartProvider>
                <App />
              </CartProvider>
            </CatalogueProvider>
          </LaunchProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)
