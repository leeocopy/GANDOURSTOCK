import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProducts } from '../hooks/useProducts'
import { computeRemaining, getStockStatus } from '../utils/sizingEngine'
import { Search, SortAsc, SortDesc, Trash2, TrendingDown, Package2 } from 'lucide-react'

export default function InventoryPage() {
  const { products, deleteProduct, updateSold } = useProducts()
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortDir, setSortDir] = useState('asc')

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDir('asc')
    }
  }

  const filtered = products
    .filter((p) => {
      const q = search.toLowerCase()
      return (
        p.name.toLowerCase().includes(q) ||
        p.colorName.toLowerCase().includes(q) ||
        p.size.toLowerCase().includes(q) ||
        p.personHeight.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      let valA = a[sortBy], valB = b[sortBy]
      if (sortBy === 'remaining') {
        valA = computeRemaining(a.stockInitial, a.stockSold)
        valB = computeRemaining(b.stockInitial, b.stockSold)
      }
      if (typeof valA === 'string') valA = valA.toLowerCase()
      if (typeof valB === 'string') valB = valB.toLowerCase()
      const cmp = valA < valB ? -1 : valA > valB ? 1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })

  const SortButton = ({ field, label }) => (
    <button
      onClick={() => toggleSort(field)}
      className={`flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider transition-colors ${sortBy === field ? 'text-cyan-neon' : 'text-white/30 hover:text-white/60'}`}
    >
      {label}
      {sortBy === field ? (
        sortDir === 'asc' ? <SortAsc size={10} /> : <SortDesc size={10} />
      ) : <SortAsc size={10} className="opacity-30" />}
    </button>
  )

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gradient-cyan text-glow">Inventaire</h1>
          <p className="text-xs text-white/30 font-mono">{products.length} produits enregistrés</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          className="input-glass pl-9"
          placeholder="Rechercher par nom, couleur, taille, hauteur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-3 px-4 py-3 border-b border-white/5 bg-white/2">
          <SortButton field="name" label="Produit" />
          <SortButton field="size" label="Taille" />
          <SortButton field="personHeight" label="Hauteur" />
          <SortButton field="length" label="Long." />
          <SortButton field="chest" label="Poi." />
          <SortButton field="remaining" label="Stock" />
          <span className="text-[10px] font-mono uppercase text-white/20">Actions</span>
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center text-center">
            <Package2 size={32} className="text-white/10 mb-2" />
            <p className="text-white/30 text-sm">Aucun résultat</p>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((p, i) => {
              const remaining = computeRemaining(p.stockInitial, p.stockSold)
              const status = getStockStatus(remaining, p.stockInitial)
              const badgeClass = { L: 'badge-L', XL: 'badge-XL', XXL: 'badge-XXL' }[p.size] || 'badge-L'

              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-3 items-center px-4 py-3.5 border-b border-white/4 hover:bg-white/2 transition-colors group"
                >
                  {/* Name + color */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-6 h-6 rounded flex-shrink-0 ring-1 ring-white/10" style={{ backgroundColor: p.color }} />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white/80 truncate">{p.name}</p>
                      <p className="text-[10px] text-white/30">{p.colorName}</p>
                    </div>
                  </div>

                  {/* Size */}
                  <div><span className={`badge-size ${badgeClass}`}>{p.size}</span></div>

                  {/* Height */}
                  <p className="text-[10px] text-white/50 font-mono">{p.personHeight}</p>

                  {/* Length */}
                  <p className="text-xs text-white/60 font-mono">{p.length}</p>

                  {/* Chest */}
                  <p className="text-xs text-white/60 font-mono">{p.chest}</p>

                  {/* Stock */}
                  <div className="flex items-center gap-2">
                    <span className={status.indicator} />
                    <span className="text-sm font-bold font-mono" style={{ color: status.color }}>{remaining}</span>
                    <span className="text-[10px] text-white/25 font-mono">/{p.stockInitial}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        const sold = parseInt(prompt(`Ventes pour "${p.name}" (actuel: ${p.stockSold}):`, p.stockSold), 10)
                        if (!isNaN(sold) && sold >= 0) updateSold(p.id, sold)
                      }}
                      className="p-1.5 text-white/30 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all"
                      title="Mettre à jour les ventes"
                    >
                      <TrendingDown size={13} />
                    </button>
                    <button
                      onClick={() => { if (confirm(`Supprimer "${p.name}" ?`)) deleteProduct(p.id) }}
                      className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Supprimer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>
    </>
  )
}
