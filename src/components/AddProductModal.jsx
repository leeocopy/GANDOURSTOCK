import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Zap, ChevronDown, AlertCircle, CheckCircle2 } from 'lucide-react'
import { computeSize, SIZE_RULES } from '../utils/sizingEngine'
import { useProducts } from '../hooks/useProducts'

const PRESET_COLORS = [
  { hex: '#C8A97E', name: 'Beige Sablé' },
  { hex: '#F5F0E8', name: 'Blanc Ivoire' },
  { hex: '#1a1a2e', name: 'Noir Profond' },
  { hex: '#78866B', name: 'Kaki Olive' },
  { hex: '#6B7280', name: 'Gris Acier' },
  { hex: '#8B4513', name: 'Marron Cuir' },
  { hex: '#2C4A7C', name: 'Bleu Royal' },
  { hex: '#5C4033', name: 'Chocolat' },
]

export default function AddProductModal({ onClose }) {
  const { addProduct } = useProducts()
  const [form, setForm] = useState({
    name: '',
    color: '#C8A97E',
    colorName: 'Beige Sablé',
    length: '',
    chest: '',
    stockInitial: '',
    imageUrl: '',
  })
  const [computed, setComputed] = useState(null)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState({})

  // Auto-compute sizing whenever length changes
  useEffect(() => {
    if (form.length) {
      const result = computeSize(parseFloat(form.length))
      setComputed(result)
    } else {
      setComputed(null)
    }
  }, [form.length])

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }))

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Nom requis'
    if (!form.length || isNaN(parseFloat(form.length))) e.length = 'Longueur invalide'
    if (!form.chest || isNaN(parseFloat(form.chest))) e.chest = 'Poitrine invalide'
    if (!form.stockInitial || isNaN(parseInt(form.stockInitial, 10))) e.stockInitial = 'Stock requis'
    if (!computed) e.length = 'Longueur hors plage standard'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    addProduct(form)
    setSuccess(true)
    setTimeout(() => {
      onClose()
    }, 1400)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(5,7,10,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: 'spring', damping: 22 }}
        className="glass-card w-full max-w-lg relative overflow-hidden shadow-cyan-glow"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success overlay */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center"
              style={{ background: 'rgba(5,7,10,0.95)', backdropFilter: 'blur(4px)' }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12 }}
              >
                <CheckCircle2 size={56} className="text-green-400 mx-auto mb-3" />
              </motion.div>
              <p className="text-green-400 font-semibold text-lg">Produit ajouté !</p>
              <p className="text-white/40 text-xs mt-1 font-mono">Taille auto-calculée: {computed?.size}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,242,255,0.1)', border: '1px solid rgba(0,242,255,0.2)' }}>
              <Zap size={15} className="text-cyan-neon" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white/90">Nouveau Produit</h2>
              <p className="text-[10px] text-white/30 font-mono">Taille auto-calculée</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Product Name */}
          <div>
            <label className="label-glass">Nom du Produit</label>
            <input
              type="text"
              className={`input-glass ${errors.name ? 'border-red-500/50' : ''}`}
              placeholder="ex: Gandoura Prestige Blanc"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Length & Chest in a row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-glass">Longueur (cm) *</label>
              <input
                type="number"
                step="0.5"
                min="100"
                max="200"
                className={`input-glass font-mono ${errors.length ? 'border-red-500/50' : computed ? 'border-cyan-neon/30' : ''}`}
                placeholder="142–160+"
                value={form.length}
                onChange={(e) => set('length', e.target.value)}
              />
              {errors.length && <p className="text-red-400 text-xs mt-1">{errors.length}</p>}
            </div>
            <div>
              <label className="label-glass">Poitrine (cm) *</label>
              <input
                type="number"
                step="0.5"
                min="80"
                max="160"
                className={`input-glass font-mono ${errors.chest ? 'border-red-500/50' : ''}`}
                placeholder="118–132"
                value={form.chest}
                onChange={(e) => set('chest', e.target.value)}
              />
              {errors.chest && <p className="text-red-400 text-xs mt-1">{errors.chest}</p>}
            </div>
          </div>

          {/* AUTO-COMPUTED SIZING PANEL */}
          <AnimatePresence>
            {form.length && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className={`rounded-xl p-4 border ${computed
                  ? 'bg-cyan-neon/5 border-cyan-neon/20'
                  : 'bg-amber-500/5 border-amber-500/20'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    {computed
                      ? <Zap size={13} className="text-cyan-neon" />
                      : <AlertCircle size={13} className="text-amber-400" />
                    }
                    <span className="text-[10px] font-mono tracking-widest uppercase text-white/40">
                      {computed ? '⚡ Calcul Automatique — Moteur Marocain' : '⚠ Hors Plage Standard'}
                    </span>
                  </div>

                  {computed ? (
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Taille</p>
                        <span className={`badge-size badge-${computed.size} text-sm px-3 py-1`}>
                          {computed.size}
                        </span>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Hauteur</p>
                        <p className="text-xs font-mono text-white/80">{computed.personHeight}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Épaules</p>
                        <p className="text-xs font-mono text-white/80">{computed.shoulder}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-amber-400/80">
                      Plages valides: L (142–145), XL (150–155), XXL (≥ 160 cm)
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Color Picker */}
          <div>
            <label className="label-glass">Couleur</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => { set('color', c.hex); set('colorName', c.name) }}
                  className={`w-8 h-8 rounded-lg ring-2 transition-all ${form.color === c.hex ? 'ring-cyan-neon scale-110' : 'ring-transparent hover:ring-white/30'}`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
              <input
                type="color"
                value={form.color}
                onChange={(e) => { set('color', e.target.value); set('colorName', 'Personnalisé') }}
                className="w-8 h-8 rounded-lg cursor-pointer border border-white/10 bg-transparent"
                title="Couleur personnalisée"
              />
            </div>
            <p className="text-xs text-white/30 font-mono">{form.colorName}</p>
          </div>

          {/* Stock Initial */}
          <div>
            <label className="label-glass">Stock Initial *</label>
            <input
              type="number"
              min="0"
              max="9999"
              className={`input-glass font-mono ${errors.stockInitial ? 'border-red-500/50' : ''}`}
              placeholder="ex: 20"
              value={form.stockInitial}
              onChange={(e) => set('stockInitial', e.target.value)}
            />
            {errors.stockInitial && <p className="text-red-400 text-xs mt-1">{errors.stockInitial}</p>}
          </div>

          {/* Size Reference Table */}
          <details className="group">
            <summary className="cursor-pointer text-xs text-white/30 hover:text-cyan-neon/60 font-mono flex items-center gap-1 transition-colors">
              <ChevronDown size={12} className="group-open:rotate-180 transition-transform" />
              Tableau de correspondance des tailles
            </summary>
            <div className="mt-2 rounded-xl overflow-hidden border border-white/5">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="bg-white/3">
                    <th className="text-left px-3 py-2 text-white/30">Longueur</th>
                    <th className="text-left px-3 py-2 text-white/30">Taille</th>
                    <th className="text-left px-3 py-2 text-white/30">Hauteur</th>
                    <th className="text-left px-3 py-2 text-white/30">Épaules</th>
                  </tr>
                </thead>
                <tbody>
                  {SIZE_RULES.map((r) => (
                    <tr key={r.label} className="border-t border-white/5">
                      <td className="px-3 py-2 text-white/60">
                        {r.lengthMax === Infinity ? `≥ ${r.lengthMin}` : `${r.lengthMin}–${r.lengthMax}`} cm
                      </td>
                      <td className="px-3 py-2">
                        <span className={`badge-size badge-${r.label}`}>{r.label}</span>
                      </td>
                      <td className="px-3 py-2 text-white/60">{r.personHeight}</td>
                      <td className="px-3 py-2 text-white/60">{r.shoulder}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white/40 bg-white/3 border border-white/8 hover:bg-white/6 transition-all"
            >
              Annuler
            </button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 btn-cyan justify-center py-2.5"
            >
              <Zap size={14} />
              Ajouter le Produit
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
