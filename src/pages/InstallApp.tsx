import { Download, Share2 } from 'lucide-react'
import { useInstallPrompt } from '../hooks/useInstallPrompt'

export function InstallApp() {
  const { canPrompt, promptInstall } = useInstallPrompt()
  return (
    <section className="page-stack">
      <h1>Install App</h1>
      <article className="form-panel">
        <h2>Android</h2>
        <p>Use Chrome and choose Add to Home screen from the browser menu when the install prompt is not shown.</p>
        <button className="button primary" disabled={!canPrompt} onClick={() => void promptInstall()}><Download size={18} />Install</button>
      </article>
      <article className="form-panel">
        <h2>iPhone</h2>
        <p>Open this app in Safari, tap Share, then tap Add to Home Screen.</p>
        <Share2 size={24} />
      </article>
    </section>
  )
}
