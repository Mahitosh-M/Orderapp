import { useEffect, useRef, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { useCatalogue } from '../../hooks/useCatalogue'
import { getCategoryAdminServices, loadManagedCategoryImages, logoutCategoryAdmin, requireCategoryAdmin, resetCategoryImage, saveCategoryImage, loadSavedProductImage, saveProductImage, resetProductImage } from '../../services/categoryAdminService'
import { acceptAdminHandoff } from '../../services/adminHandoff'
import { invalidateProductImage } from '../../services/productImageService'
import { squareCrop } from '../../utils/categoryCrop'
import { getCategoryArtwork } from '../../utils/categoryArtwork'
import { removeEdgeWhite } from '../../utils/imageBackground'
import { StaffOrders } from '../staff/StaffOrders'
import './CategoryImages.css'

type Panel = 'categories' | 'products' | 'orders' | 'catalogue'
export function CategoryImages() {
  const { catalogue, refresh, refreshing, error: catalogueError } = useCatalogue()
  const [ready, setReady] = useState(false), [admin, setAdmin] = useState(false)
  const [panel, setPanel] = useState<Panel>('categories')
  const [category, setCategory] = useState(''), [productId, setProductId] = useState(''), [search, setSearch] = useState('')
  const [images, setImages] = useState<Record<string, string[]>>({})
  const [productSaved, setProductSaved] = useState<{ id: string; url: string | null } | null>(null)
  const [source, setSource] = useState<HTMLImageElement | null>(null)
  const [zoom, setZoom] = useState(1), [x, setX] = useState(50), [y, setY] = useState(50)
  const [fit, setFit] = useState(true), [removeWhite, setRemoveWhite] = useState(true)
  const [busy, setBusy] = useState(false), [fileLoading, setFileLoading] = useState(false)
  const [error, setError] = useState(''), [message, setMessage] = useState('')
  const canvas = useRef<HTMLCanvasElement>(null), fileVersion = useRef(0)
  const product = catalogue?.products.find(row => row.id === productId)
  const isProduct = panel === 'products'
  const selection = isProduct ? productId : category
  const saved = isProduct ? productSaved?.id === productId ? productSaved.url : null : images[category.trim().toLowerCase()]?.[0]
  const currentImage = isProduct ? saved || product?.imageUrl : saved || getCategoryArtwork(category)

  useEffect(() => {
    let cancelled = false, unsubscribe = () => {}
    const stopHandoff = acceptAdminHandoff(message => { if (!cancelled) { setError(message); setReady(true) } })
    try {
      unsubscribe = onAuthStateChanged(getCategoryAdminServices().auth, async user => {
        if (cancelled) return
        setAdmin(false)
        if (!user && window.opener) return
        if (user) {
          try {
            await requireCategoryAdmin()
            const next = await loadManagedCategoryImages()
            if (!cancelled) { setImages(next); setAdmin(true); setError('') }
          } catch { if (!cancelled) setError('Unable to verify Admin access or load images. Reopen from CISapp Admin.') }
        }
        if (!cancelled) setReady(true)
      })
    } catch { setError('CISapp Admin connection is not configured.'); setReady(true) }
    return () => { cancelled = true; unsubscribe(); stopHandoff() }
  }, [])

  useEffect(() => {
    if (!admin || !isProduct || !productId) return
    let cancelled = false
    loadSavedProductImage(productId).then(url => { if (!cancelled) setProductSaved({ id: productId, url }) })
      .catch(() => { if (!cancelled) setError('Unable to load the saved product image.') })
    return () => { cancelled = true }
  }, [admin, isProduct, productId])

  useEffect(() => {
    const context = canvas.current?.getContext('2d', { willReadFrequently: true })
    if (!context || !source) return
    context.clearRect(0, 0, 512, 512)
    if (!isProduct) { context.fillStyle = '#fff'; context.fillRect(0, 0, 512, 512) }
    if (fit) {
      const scale = 512 / Math.max(source.naturalWidth, source.naturalHeight)
      const w = source.naturalWidth * scale, h = source.naturalHeight * scale
      context.drawImage(source, (512 - w) / 2, (512 - h) / 2, w, h)
    } else {
      const { sx, sy, side } = squareCrop(source.naturalWidth, source.naturalHeight, zoom, x, y)
      context.drawImage(source, sx, sy, side, side, 0, 0, 512, 512)
    }
    if (isProduct && removeWhite) {
      const pixels = context.getImageData(0, 0, 512, 512)
      removeEdgeWhite(pixels.data, 512, 512)
      context.putImageData(pixels, 0, 0)
    }
  }, [source, zoom, x, y, isProduct, fit, removeWhite])

  function clearEdit() { fileVersion.current++; setSource(null); setFileLoading(false); setError(''); setMessage('') }
  async function openImage(url: string, fitWhole: boolean, failureMessage: string) {
    const version = ++fileVersion.current
    setSource(null); setFileLoading(true); setError(''); setMessage('')
    try {
      const image = new Image()
      image.crossOrigin = 'anonymous'
      image.src = url
      await image.decode()
      if (version !== fileVersion.current) return
      if (image.naturalWidth * image.naturalHeight > 40000000) throw new Error('Image too large.')
      setSource(image); setZoom(1); setX(50); setY(50); setFit(fitWhole)
    } catch { if (version === fileVersion.current) setError(failureMessage) }
    finally { if (version === fileVersion.current) setFileLoading(false) }
  }
  async function chooseFile(file?: File) {
    clearEdit()
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) {
      setError('Choose a JPG, PNG or WebP image under 10 MB.'); return
    }
    const url = URL.createObjectURL(file)
    try { await openImage(url, isProduct, 'Unable to open this image. Choose a smaller image.') }
    finally { URL.revokeObjectURL(url) }
  }
  async function save() {
    if (!selection || !source || !canvas.current) return
    setBusy(true); setError(''); setMessage('')
    try {
      const type = isProduct ? 'image/webp' : 'image/jpeg'
      let result = canvas.current.toDataURL(type, 0.85)
      if (result.length > 240000) result = canvas.current.toDataURL(type, 0.65)
      if (isProduct && product) {
        await saveProductImage(product.id, product.name, result)
        setProductSaved({ id: product.id, url: result }); invalidateProductImage(product.id)
      } else {
        await saveCategoryImage(category, result)
        setImages(current => ({ ...current, [category.trim().toLowerCase()]: [result] }))
      }
      setMessage('Image saved at 512 × 512. Refresh the ordering page to see the update.')
    } catch { setError('Unable to save. Check Admin access and connection, or choose a smaller image.') }
    finally { setBusy(false) }
  }
  async function reset() {
    if (!selection || !window.confirm('Restore the original image?')) return
    setBusy(true); setError(''); setMessage('')
    try {
      if (isProduct) { await resetProductImage(productId); setProductSaved({ id: productId, url: null }); invalidateProductImage(productId) }
      else { await resetCategoryImage(category); setImages(current => { const next = { ...current }; delete next[category.trim().toLowerCase()]; return next }) }
      setSource(null); setMessage('Original image restored.')
    } catch { setError('Unable to restore the image. Please try again.') }
    finally { setBusy(false) }
  }
  async function logout() { try { await logoutCategoryAdmin(); setSource(null); setError(''); setMessage('') } catch { setError('Unable to sign out.') } }

  return <main className="category-admin page-stack">
    <header><h1>Orderapp Admin</h1><a href={import.meta.env.DEV ? 'http://127.0.0.1:5173/admin' : 'https://cisapp-236ab.web.app/admin'}>CISapp Admin</a></header>
    {error && <p role="alert">{error}</p>}{message && <p role="status">{message}</p>}
    {!ready ? <p>Connecting Admin session…</p> : !admin ? <section className="category-admin-panel"><h2>Admin access required</h2><p>Open Order from your CISapp Admin portal.</p></section> : <>
      <nav className="category-admin-actions" aria-label="Admin settings">
        {(['categories', 'products', 'orders', 'catalogue'] as const).map(value => <button key={value} className="button" disabled={busy} aria-pressed={panel === value} onClick={() => { clearEdit(); setPanel(value) }}>{({ categories: 'Category images', products: 'Product images', orders: 'Orders', catalogue: 'Catalogue' })[value]}</button>)}
        <button className="button" disabled={busy} onClick={() => void logout()}>Sign out</button>
      </nav>
      {panel === 'orders' ? <StaffOrders title="Orders" /> : panel === 'catalogue' ? <section className="category-admin-panel">
        <h2>Catalogue</h2><p>Version: {catalogue?.version ?? 'Unavailable'} · Products: {catalogue?.products.length ?? 0} · Categories: {catalogue?.categories.length ?? 0}</p>
        <button className="button" disabled={refreshing} onClick={() => void refresh().catch(() => setError('Unable to refresh catalogue.'))}>{refreshing ? 'Refreshing…' : 'Refresh catalogue'}</button>
        {catalogueError && <p role="alert">{catalogueError}</p>}
        <p>Manage product names, categories, prices and stock in Catalogue Manager, then publish the catalogue.</p>
      </section> : <section className="category-admin-panel">
        <h2>{isProduct ? 'Product images' : 'Category images'}</h2>
        {isProduct ? <>
          <label>Search product name<input type="search" value={search} disabled={busy} onChange={event => { setSearch(event.target.value); setProductId(''); clearEdit() }} placeholder="Search medicines…" /></label>
          <label>Product<select disabled={busy} value={productId} onChange={event => { clearEdit(); setProductId(event.target.value) }}>
            <option value="">Select product</option>{catalogue?.products.filter(row => row.name.toLowerCase().includes(search.trim().toLowerCase())).slice(0, 100).map(row => <option key={row.id} value={row.id}>{row.name} · {row.company}</option>)}
          </select></label><small>Showing up to 100 matches. Refine your search to find a product.</small>
        </> : <label>Category<select disabled={busy} value={category} onChange={event => { clearEdit(); setCategory(event.target.value) }}>
          <option value="">Select category</option>{catalogue?.categories.map(name => <option key={name} value={name}>{name}</option>)}
        </select></label>}
        {selection && currentImage && <div className="category-admin-current"><div><span>Current image</span><img className="category-admin-saved" src={currentImage} alt={isProduct ? product?.name : category} /></div>
          <button type="button" className="button" disabled={busy || fileLoading} onClick={() => void openImage(currentImage, false, 'Unable to open the current image. Upload the image to crop it instead.')}>Crop current image</button></div>}
        <label>Upload image<input key={panel + selection} type="file" accept="image/jpeg,image/png,image/webp" disabled={!selection || busy} onChange={event => void chooseFile(event.target.files?.[0])} /></label>
        {fileLoading && <p role="status">Opening image…</p>}
        {source && <div className="category-crop">
          <canvas ref={canvas} width={512} height={512} aria-label="Cropped image preview" />
          <div className="category-admin-actions" role="group" aria-label="Image framing">
            <button type="button" className="button" aria-pressed={!fit} disabled={busy} onClick={() => setFit(false)}>Crop image</button>
            <button type="button" className="button" aria-pressed={fit} disabled={busy} onClick={() => setFit(true)}>Fit whole image</button>
          </div>
          {isProduct && <label className="category-admin-check"><input type="checkbox" checked={removeWhite} disabled={busy} onChange={event => setRemoveWhite(event.target.checked)} />Remove edge white background</label>}
          {!fit && <><label>Zoom<input type="range" min="1" max="3" step="0.01" value={zoom} disabled={busy} onChange={event => setZoom(Number(event.target.value))} /></label>
            <label>Horizontal position<input type="range" min="0" max="100" value={x} disabled={busy} onChange={event => setX(Number(event.target.value))} /></label>
            <label>Vertical position<input type="range" min="0" max="100" value={y} disabled={busy} onChange={event => setY(Number(event.target.value))} /></label></>}
        </div>}
        <small>Standard image size: 512 × 512.</small>
        <div className="category-admin-actions"><button className="button" disabled={!selection || !source || busy || fileLoading} onClick={() => void save()}>{busy ? 'Saving…' : 'Save image'}</button>
          <button className="button" disabled={!selection || busy || !saved} onClick={() => void reset()}>Restore original</button></div>
        {!catalogue && <p>Catalogue unavailable. Refresh to load products and categories.</p>}
      </section>}
    </>}
  </main>
}
