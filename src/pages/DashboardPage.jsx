import { useState } from 'react'
import { motion } from 'framer-motion'
import { Package2, TrendingDown, TrendingUp, AlertTriangle, PlusCircle, Search, Coins, Wallet } from 'lucide-react'
import { useProducts } from '../hooks/useProducts'
import ProductCard from '../components/ProductCard'
import { computeRemaining } from '../utils/sizingEngine'

const PROFILE_FILTERS = ['Tous', 'Standard', 'Long', 'Shortened']

function StatCard({ icon: Icon, label, value, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-card p-5 flex items-center gap-4"
    >
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p className="text-xs text-white/30 font-mono uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold mt-0.5" style={{ color }}>{value}</p>
      </div>
    </motion.div>
  )
}

function FilterPill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="text-xs px-3 py-1.5 rounded-lg font-mono border transition-all"
      style={active ? {
        background: 'rgba(0,242,255,0.1)',
        borderColor: 'rgba(0,242,255,0.3)',
        color: '#00f2ff',
      } : {
        background: 'transparent',
        borderColor: 'rgba(255,255,255,0.07)',
        color: 'rgba(255,255,255,0.35)',
      }}
    >
      {children}
    </button>
  )
}

export default function DashboardPage({ onNavigate }) {
  const { products, stats, salesStats, deleteProduct, sellOne } = useProducts()
  const [profileFilter, setProfileFilter] = useState('Tous')
  const [heightSearch, setHeightSearch] = useState('')

  const filtered = products.filter((p) => {
    // Hide fully sold products from dashboard
    const rem = computeRemaining(p.stockInitial, p.stockSold)
    if (rem === 0) return false

    // If a product has no units, just check default
    if (!p.units || p.units.length === 0) return true
    
    // Check if ANY unit matches the criteria
    return p.units.some(u => {
      const profMatch = profileFilter === 'Tous' || u.profile === profileFilter
      const heightMatch = !heightSearch || u.personHeight.toLowerCase().includes(heightSearch.toLowerCase())
      return profMatch && heightMatch
    })
  })

  return (
    <>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gradient-cyan text-glow">Dashboard</h1>
          <p className="text-xs text-white/30 font-mono mt-0.5">
            {new Date().toLocaleDateString('fr-MA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={() => onNavigate('add')}
          className="btn-cyan"
        >
          <PlusCircle size={16} />
          Ajouter
        </motion.button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-7">
        <StatCard icon={Package2}     label="Produits"      value={stats.totalProducts}  color="#00f2ff" delay={0}    />
        <StatCard icon={TrendingUp}   label="Stock Restant"  value={stats.totalRemaining} color="#22c55e" delay={0.05} />
        <StatCard icon={TrendingDown} label="Vendus"         value={stats.totalSold}      color="#f59e0b" delay={0.1}  />
        <StatCard icon={AlertTriangle} label="Épuisés"       value={stats.outOfStock}     color="#ef4444" delay={0.15} />
        <StatCard icon={Coins}         label="Ventes (DH)"   value={Math.round(salesStats?.total_revenue || 0)} color="#a855f7" delay={0.2} />
        <StatCard icon={Wallet}        label="Bénéfice (DH)" value={Math.round(salesStats?.total_profit || 0)} color="#ec4899" delay={0.25} />
      </div>

      {/* Smart Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-5 p-3 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
        
        {/* Height Search */}
        <div className="relative flex-1 max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={14} className="text-white/30" />
          </div>
          <input
            type="text"
            placeholder="Rechercher par Hauteur (ex: 1m72)..."
            value={heightSearch}
            onChange={(e) => setHeightSearch(e.target.value)}
            className="input-glass font-mono w-full pl-9 pr-3 py-2 text-sm"
          />
        </div>

        <div className="w-px h-5 bg-white/8 hidden md:block" />

        {/* Quick Filters */}
        <div className="flex items-center gap-2 flex-wrap flex-1">
          <span className="text-[10px] text-white/25 font-mono uppercase tracking-widest hidden sm:block">Profil:</span>
          {PROFILE_FILTERS.map(p => (
            <FilterPill key={p} active={profileFilter === p} onClick={() => setProfileFilter(p)}>{p}</FilterPill>
          ))}
        </div>

        {(profileFilter !== 'Tous' || heightSearch !== '') && (
          <button
            onClick={() => { setProfileFilter('Tous'); setHeightSearch('') }}
            className="text-xs text-cyan-neon/40 hover:text-cyan-neon font-mono transition-colors md:ml-auto"
          >
            ✕ Réinitialiser
          </button>
        )}
      </div>

      {/* Count */}
      <p className="text-xs text-white/20 font-mono mb-5">
        {filtered.length} produit{filtered.length !== 1 ? 's' : ''} affiché{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="glass-card py-20 flex flex-col items-center justify-center text-center"
        >
          <Package2 size={40} className="text-white/8 mb-3" />
          <p className="text-white/25 text-sm">Aucun produit trouvé</p>
          <p className="text-white/15 text-xs mt-1 font-mono">Modifiez les filtres ou ajoutez un produit</p>
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => onNavigate('add')}
            className="btn-cyan mt-5 text-xs"
          >
            <PlusCircle size={14} /> Ajouter un Gandoura
          </motion.button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              index={i}
              onDelete={deleteProduct}
              onSellOne={sellOne}
              onEdit={(p) => onNavigate('edit', p)}
            />
          ))}
        </div>
      )}
    </>
  )
}
