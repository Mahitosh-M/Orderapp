import { useContext } from 'react'
import { CatalogueContext } from '../context/CatalogueContext'

export function useCatalogue() {
  const value = useContext(CatalogueContext)
  if (!value) throw new Error('useCatalogue must be used inside CatalogueProvider')
  return value
}
