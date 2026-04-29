import { createContext, useContext, useState, useCallback } from 'react'
import { loadProducts, saveProducts, generateId } from '../data/store'
import { computeSize, computeRemaining } from '../utils/sizingEngine'

const ProductContext = createContext(null)

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(() => loadProducts())

  const persist = useCallback((updated) => {
    setProducts(updated)
    saveProducts(updated)
  }, [])

  /** Add a new product. formData.units is an array of { length, chest }. */
  const addProduct = useCallback((formData) => {
    const qty = parseInt(formData.stockInitial, 10) || 1
    const units = (formData.units || []).slice(0, qty).map((u) => {
      return {
        length:      parseFloat(u.length) || 0,
        chest:       parseFloat(u.chest)  || 0,
        size:        u.sizing?.size        || 'Custom',
        personHeight: u.sizing?.personHeight || 'Spéciale',
        profile:     u.sizing?.profile     || 'Custom',
        sizing:      u.sizing
      }
    })

    const newProduct = {
      id:           generateId(),
      name:         formData.name,
      color:        formData.color     || '#888888',
      colorName:    formData.colorName || '',
      stockInitial: qty,
      stockSold:    0,
      imageUrl:     formData.imageUrl  || '',
      createdAt:    new Date().toISOString(),
      units,
    }
    persist([newProduct, ...products])
    return newProduct
  }, [products, persist])

  /** Sell one unit — increment stockSold by 1. */
  const sellOne = useCallback((id) => {
    const updated = products.map((p) => {
      if (p.id !== id) return p
      return { ...p, stockSold: Math.min(p.stockSold + 1, p.stockInitial) }
    })
    persist(updated)
  }, [products, persist])

  /** Manual set of sold count. */
  const updateSold = useCallback((id, sold) => {
    const updated = products.map((p) =>
      p.id === id ? { ...p, stockSold: Math.min(sold, p.stockInitial) } : p
    )
    persist(updated)
  }, [products, persist])

  /** Full update of a product. */
  const updateProduct = useCallback((id, formData) => {
    const qty = parseInt(formData.stockInitial, 10) || 1
    const units = (formData.units || []).slice(0, qty).map((u) => {
      return {
        length:      parseFloat(u.length) || 0,
        chest:       parseFloat(u.chest)  || 0,
        size:        u.sizing?.size        || 'Custom',
        personHeight: u.sizing?.personHeight || 'Spéciale',
        profile:     u.sizing?.profile     || 'Custom',
        sizing:      u.sizing
      }
    })

    const updated = products.map(p => {
      if (p.id !== id) return p
      return {
        ...p,
        name:         formData.name,
        color:        formData.color     || '#888888',
        colorName:    formData.colorName || '',
        stockInitial: qty,
        imageUrl:     formData.imageUrl  || p.imageUrl,
        units,
      }
    })
    persist(updated)
  }, [products, persist])

  const deleteProduct = useCallback((id) => {
    persist(products.filter((p) => p.id !== id))
  }, [products, persist])

  // Global stats
  const stats = {
    totalProducts:   products.length,
    totalRemaining:  products.reduce((s, p) => s + computeRemaining(p.stockInitial, p.stockSold), 0),
    totalSold:       products.reduce((s, p) => s + (p.stockSold || 0), 0),
    outOfStock:      products.filter((p) => computeRemaining(p.stockInitial, p.stockSold) === 0).length,
  }

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, sellOne, updateSold, deleteProduct, stats }}>
      {children}
    </ProductContext.Provider>
  )
}

export function useProducts() {
  const ctx = useContext(ProductContext)
  if (!ctx) throw new Error('useProducts must be used inside ProductProvider')
  return ctx
}
