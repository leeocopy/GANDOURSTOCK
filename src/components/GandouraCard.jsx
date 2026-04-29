import { motion } from 'framer-motion'
import { computeRemaining, getStockStatus } from '../utils/sizingEngine'
import { Trash2, Edit3, TrendingDown } from 'lucide-react'

const FLOAT_VARIANTS = [
  { duration: 5.5, delay: 0 },
  { duration: 6.5, delay: 1 },
  { duration: 5, delay: 2 },
  { duration: 7, delay: 0.5 },
  { duration: 6, delay: 1.5 },
]

export default function GandouraCard({ product, index, onDelete, onUpdateSold }) {
  const remaining = computeRemaining(product.stockInitial, product.stockSold)
  const status = getStockStatus(remaining, product.stockInitial)
  const stockPercent = product.stockInitial > 0 ? (remaining / product.stockInitial) * 100 : 0
  const floatConfig = FLOAT_VARIANTS[index % FLOAT_VARIANTS.length]

  const badgeClass = {
    L: 'badge-L',
    XL: 'badge-XL',
    XXL: 'badge-XXL',
  }[product.size] || 'badge-L'

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{
        opacity: 1,
        y: [0, -floatConfig.duration * 1.2, 0],
        scale: 1,
      }}
      transition={{
        opacity: { duration: 0.4, delay: index * 0.08 },
        scale: { duration: 0.4, delay: index * 0.08 },
        y: {
          duration: floatConfig.duration,
          delay: floatConfig.delay,
          repeat: Infinity,
          ease: 'easeInOut',
          times: [0, 0.5, 1],
        },
      }}
      whileHover={{
        scale: 1.025,
        y: -6,
        transition: { duration: 0.25, ease: 'easeOut' },
      }}
      className="glass-card p-5 cursor-default group relative overflow-hidden"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}
    >
      {/* Hover border glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: 'inset 0 0 0 1px rgba(0,242,255,0.25)' }} />

      {/* Top Row */}
      <div className="flex items-start justify-between mb-4">
        {/* Color swatch + name */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex-shrink-0 ring-1 ring-white/10"
            style={{ backgroundColor: product.color }}
          />
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white/90 truncate leading-tight">{product.name}</h3>
            <p className="text-xs text-white/40 mt-0.5">{product.colorName}</p>
          </div>
        </div>

        {/* Size badge */}
        <span className={`badge-size ${badgeClass} flex-shrink-0 ml-2`}>
          {product.size}
        </span>
      </div>

      {/* Specs grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-white/3 rounded-lg p-2 border border-white/5">
          <p className="text-[10px] text-white/30 font-mono uppercase tracking-wider">Longueur</p>
          <p className="text-sm font-semibold text-white/80 font-mono">{product.length} <span className="text-xs text-white/30">cm</span></p>
        </div>
        <div className="bg-white/3 rounded-lg p-2 border border-white/5">
          <p className="text-[10px] text-white/30 font-mono uppercase tracking-wider">Poitrine</p>
          <p className="text-sm font-semibold text-white/80 font-mono">{product.chest} <span className="text-xs text-white/30">cm</span></p>
        </div>
        <div className="bg-white/3 rounded-lg p-2 border border-white/5">
          <p className="text-[10px] text-white/30 font-mono uppercase tracking-wider">Épaules</p>
          <p className="text-xs font-semibold text-white/80 font-mono">{product.shoulder}</p>
        </div>
        <div className="bg-white/3 rounded-lg p-2 border border-white/5">
          <p className="text-[10px] text-white/30 font-mono uppercase tracking-wider">Hauteur</p>
          <p className="text-xs font-semibold text-white/80 font-mono">{product.personHeight}</p>
        </div>
      </div>

      {/* Stock section */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className={status.indicator} />
            <span className="text-xs font-medium" style={{ color: status.color }}>{status.label}</span>
          </div>
          <div className="flex items-center gap-1 font-mono">
            <span className="text-lg font-bold" style={{ color: status.color }}>{remaining}</span>
            <span className="text-xs text-white/30">/ {product.stockInitial}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stockPercent}%` }}
            transition={{ duration: 0.8, delay: index * 0.08 + 0.3, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{
              background: stockPercent > 50
                ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                : stockPercent > 20
                ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                : 'linear-gradient(90deg, #ef4444, #f87171)',
            }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-white/20 font-mono">Vendu: {product.stockSold}</span>
          <span className="text-[10px] text-white/20 font-mono">{Math.round(stockPercent)}%</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-white/5">
        <button
          onClick={() => {
            const sold = parseInt(prompt(`Unités vendues pour "${product.name}" (actuel: ${product.stockSold}):`, product.stockSold), 10)
            if (!isNaN(sold) && sold >= 0) onUpdateSold(product.id, sold)
          }}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-white/40 hover:text-amber-400 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 rounded-lg py-1.5 transition-all"
        >
          <TrendingDown size={13} />
          Vente
        </button>
        <button
          onClick={() => {
            if (confirm(`Supprimer "${product.name}" ?`)) onDelete(product.id)
          }}
          className="flex items-center justify-center gap-1.5 text-xs font-medium text-white/30 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-lg py-1.5 px-3 transition-all"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </motion.div>
  )
}
