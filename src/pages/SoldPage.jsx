import { useState } from 'react'
import { motion } from 'framer-motion'
import { Package2, Search } from 'lucide-react'
import { useProducts } from '../hooks/useProducts'
import ProductCard from '../components/ProductCard'
import { computeRemaining } from '../utils/sizingEngine'

export default function SoldPage({ onNavigate }) {
  const { products, deleteProduct } = useProducts()
  const [search, setSearch] = useState('')

  // Filter ONLY products that are completely sold out
  const filtered = products.filter((p) => {
    const rem = computeRemaining(p.stockInitial, p.stockSold)
    if (rem > 0) return false

    if (!search) return true
    
    const q = search.toLowerCase()
    return (
      p.name.toLowerCase().includes(q) ||
      p.colorName.toLowerCase().includes(q)
    )
  })

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gradient-cyan text-glow">Historique des Ventes</h1>
          <p className="text-xs text-white/30 font-mono mt-0.5">
            Gandouras complètement épuisées
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-5 p-3 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="relative flex-1 max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={14} className="text-white/30" />
          </div>
          <input
            type="text"
            placeholder="Rechercher par nom ou couleur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-glass font-mono w-full pl-9 pr-3 py-2 text-sm"
          />
        </div>
      </div>

      <p className="text-xs text-white/20 font-mono mb-5">
        {filtered.length} produit{filtered.length !== 1 ? 's' : ''} épuisé{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="glass-card py-20 flex flex-col items-center justify-center text-center"
        >
          <Package2 size={40} className="text-white/8 mb-3" />
          <p className="text-white/25 text-sm">Aucun produit épuisé trouvé</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              index={i}
              onDelete={deleteProduct}
              onSellOne={() => {}} // Disabled anyway
              onEdit={(p) => onNavigate('edit', p)}
            />
          ))}
        </div>
      )}
    </>
  )
}
