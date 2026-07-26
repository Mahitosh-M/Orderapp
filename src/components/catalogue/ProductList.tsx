import type { Product } from '../../types/product'
import { EmptyState } from '../common/EmptyState'
import { ProductCard } from './ProductCard'

export function ProductList({ products, showRelated = false }: { products: Product[]; showRelated?: boolean }) {
  if (products.length === 0) return <EmptyState title="No products found" message="Adjust search or filters to browse the catalogue." />
  return <div className="product-list">{products.map((product) => <ProductCard product={product} showRelated={showRelated} key={product.id} />)}</div>
}
