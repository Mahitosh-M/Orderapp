import { Link } from 'react-router-dom'

export function NotFound() {
  return <section className="empty-state"><h1>Page not found</h1><Link className="button primary" to="/">Go home</Link></section>
}
