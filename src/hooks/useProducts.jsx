import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { computeRemaining } from '../utils/sizingEngine'

const ProductContext = createContext(null)

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([])

  useEffect(() => {
    // Fetch products on load
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProducts(data)
      })
      .catch(err => console.error('Failed to load products', err))
  }, [])

  /** Add a new product. formData.units is an array of { length, chest }. */
  const addProduct = useCallback(async (formData) => {
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
      name:         formData.name,
      color:        formData.color     || '#888888',
      colorName:    formData.colorName || '',
      stockInitial: qty,
      stockSold:    0,
      imageUrl:     formData.imageUrl  || '',
      units,
    }

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => [{ ...newProduct, id: data.id, createdAt: new Date().toISOString() }, ...prev]);
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  /** Sell one unit — increment stockSold by 1. */
  const sellOne = useCallback(async (id) => {
    const target = products.find(p => p.id === id);
    if (!target) return;
    const newSold = Math.min(target.stockSold + 1, target.stockInitial);
    
    // Optimistic
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stockSold: newSold } : p))
    
    try {
      await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'sell', stockSold: newSold })
      });
    } catch (e) {
      console.error(e)
    }
  }, [products])

  /** Manual set of sold count. */
  const updateSold = useCallback(async (id, sold) => {
    const target = products.find(p => p.id === id);
    if (!target) return;
    const newSold = Math.min(sold, target.stockInitial);
    
    // Optimistic
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stockSold: newSold } : p))
    
    try {
      await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'sell', stockSold: newSold })
      });
    } catch (e) {
      console.error(e)
    }
  }, [products])

  /** Full update of a product. */
  const updateProduct = useCallback(async (id, formData) => {
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

    const updatePayload = {
      id,
      name:         formData.name,
      color:        formData.color     || '#888888',
      colorName:    formData.colorName || '',
      stockInitial: qty,
      imageUrl:     formData.imageUrl,
      units,
    };

    // Optimistic
    setProducts(prev => prev.map(p => {
      if (p.id !== id) return p;
      return { ...p, ...updatePayload, imageUrl: formData.imageUrl || p.imageUrl };
    }))

    try {
      await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
      });
    } catch (e) {
      console.error(e)
    }
  }, [])

  const deleteProduct = useCallback(async (id) => {
    // Optimistic
    setProducts(prev => prev.filter(p => p.id !== id))
    
    try {
      await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error(e)
    }
  }, [])

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
