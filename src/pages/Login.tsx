import { useState } from 'react'
import { LogIn } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ErrorState } from '../components/common/ErrorState'
import { isFirebaseConfigured, missingFirebaseVars } from '../services/firebase'

export function Login() {
  const { login, user, customer, authError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  if (user && customer) return <Navigate to="/" replace />

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await login(email, password)
      navigate('/')
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Login failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="logo login-logo"><span className="logo-mark">PO</span><span>Partner Order</span></div>
        <h1>Customer Login</h1>
        {!isFirebaseConfigured() && <ErrorState message={`Firebase is not configured. Missing ${missingFirebaseVars.join(', ')}.`} />}
        {(error || authError) && <ErrorState message={error ?? authError ?? ''} />}
        <form onSubmit={submit}>
          <label>Email<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
          <button className="button primary" disabled={submitting || !isFirebaseConfigured()}>
            <LogIn size={18} />
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="muted">Accounts are created by the supplier. Public registration is disabled.</p>
      </section>
    </main>
  )
}
