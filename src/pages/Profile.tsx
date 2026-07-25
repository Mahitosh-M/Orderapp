import { useLaunch } from '../hooks/useLaunch'

export function Profile() {
  const { profile: customer } = useLaunch()

  return (
    <section className="form-panel">
      <h1>Profile</h1>
      <dl className="details-grid">
        <div><dt>Business name</dt><dd>{customer?.businessName ?? 'Not configured'}</dd></div>
        <div><dt>Customer code</dt><dd>{customer?.customerCode ?? 'Not configured'}</dd></div>
        <div><dt>Owner</dt><dd>{customer?.ownerName ?? 'Not configured'}</dd></div>
        <div><dt>Mobile</dt><dd>{customer?.mobile ?? 'Not configured'}</dd></div>
        <div><dt>Email</dt><dd>{customer?.email ?? 'Not configured'}</dd></div>
        <div><dt>Address</dt><dd>{customer?.address ?? 'Not configured'}</dd></div>
        <div><dt>Status</dt><dd>{customer?.active ? 'Active' : 'Not configured'}</dd></div>
      </dl>
      <p className="muted">Contact the supplier for account-detail changes.</p>
    </section>
  )
}
