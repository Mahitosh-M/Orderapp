import type { Product } from '../../types/product'
import { EmptyState } from '../common/EmptyState'
import { ProductCard } from './ProductCard'

export function ProductList({ products, relatedSearchTerm = '' }: { products: Product[]; relatedSearchTerm?: string }) {
  if (products.length === 0) return <EmptyState title="No products found" message="Adjust search or filters to browse the catalogue." />
  return <div className="product-list">{products.map((product) => <ProductCard product={product} relatedSearchTerm={relatedSearchTerm} key={product.id} />)}</div>
}
