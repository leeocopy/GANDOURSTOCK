import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProducts } from '../hooks/useProducts'
import { computeSize, SIZE_RULES } from '../utils/sizingEngine'
import {
  ArrowLeft, Zap, ImagePlus, X, CheckCircle2,
  AlertCircle, ChevronDown, Plus, Minus,
} from 'lucide-react'

/* ─────────── Constants ─────────── */
const PRESET_COLORS = [
  { hex: '#C8A97E', name: 'Beige Sablé'   },
  { hex: '#F5F0E8', name: 'Blanc Ivoire'  },
  { hex: '#1a1a2e', name: 'Noir Profond'  },
  { hex: '#78866B', name: 'Kaki Olive'    },
  { hex: '#6B7280', name: 'Gris Acier'    },
  { hex: '#8B4513', name: 'Marron Cuir'   },
  { hex: '#2C4A7C', name: 'Bleu Royal'    },
  { hex: '#5C4033', name: 'Chocolat'      },
  { hex: '#D4A017', name: 'Or Doré'       },
  { hex: '#4A0404', name: 'Bordeaux'      },
]

/* ─────────── Inline Calculated Profile ─────────── */
function SizeBadge({ sizing, compact = false }) {
  if (!sizing) return null
  const st = sizing.style
  return (
    <motion.span
      key={sizing.size}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1 rounded-lg font-mono font-bold ${compact ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'}`}
      style={{ background: st.bg, border: `1px solid ${st.border}`, color: st.text }}
    >
      {sizing.size}
    </motion.span>
  )
}

/* ─────────── One unit row ─────────── */
function UnitRow({ index, unit, onChange, canRemove, onRemove }) {
  const sizing = (unit.length !== '' && unit.chest !== '') ? computeSize(unit.length, unit.chest) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: -6, height: 0 }}
      transition={{ duration: 0.22 }}
      className="overflow-hidden"
    >
      <div
        className="rounded-xl p-3 mb-2"
        style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Row header */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span
              className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black font-mono"
              style={{ background: 'rgba(0,242,255,0.1)', color: '#00f2ff', border: '1px solid rgba(0,242,255,0.2)' }}
            >
              {index + 1}
            </span>
            <span className="text-[10px] text-white/30 font-mono uppercase tracking-wider">Pièce #{index + 1}</span>
            {sizing && <SizeBadge sizing={sizing} compact />}
          </div>
          {canRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="w-5 h-5 flex items-center justify-center rounded text-white/20 hover:text-red-400 transition-colors"
            >
              <X size={11} />
            </button>
          )}
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label-glass" style={{ fontSize: '9px' }}>Longueur (cm) *</label>
            <input
              type="number"
              step="0.5"
              min="100"
              max="220"
              placeholder="ex: 152"
              value={unit.length}
              onChange={(e) => onChange(index, 'length', e.target.value)}
              className="input-glass font-mono"
              style={{
                padding: '0.45rem 0.7rem',
                fontSize: '0.85rem',
                borderColor: sizing
                  ? sizing.isCustom ? 'rgba(245,158,11,0.4)' : 'rgba(0,242,255,0.3)'
                  : undefined,
              }}
            />
          </div>
          <div>
            <label className="label-glass" style={{ fontSize: '9px' }}>Poitrine (cm) *</label>
            <input
              type="number"
              step="0.5"
              min="20"
              max="100"
              placeholder="ex: 32"
              value={unit.chest}
              onChange={(e) => onChange(index, 'chest', e.target.value)}
              className="input-glass font-mono"
              style={{ padding: '0.45rem 0.7rem', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        {/* Computed profile inline */}
        <AnimatePresence>
          {sizing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div
                className="mt-2 rounded-lg px-3 py-2 grid grid-cols-3 gap-2 text-center"
                style={{
                  background: sizing.isCustom ? 'rgba(245,158,11,0.05)' : 'rgba(0,242,255,0.04)',
                  border: `1px solid ${sizing.isCustom ? 'rgba(245,158,11,0.15)' : 'rgba(0,242,255,0.12)'}`,
                }}
              >
                {[
                  { label: 'Profil',   value: sizing.profile       },
                  { label: 'Taille',   value: sizing.size         },
                  { label: 'Hauteur',  value: sizing.personHeight  },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[8px] text-white/25 font-mono uppercase tracking-wider">{label}</p>
                    <p
                      className="text-[10px] font-bold font-mono mt-0.5"
                      style={{ color: sizing.color }}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>
              {sizing.isCustom && (
                <p className="text-[10px] text-amber-400/60 font-mono mt-1 flex items-center gap-1">
                  <AlertCircle size={9} /> Taille hors standard — sera enregistrée comme "Custom"
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

/* ─────────── Main Form ─────────── */
const EMPTY_UNIT = () => ({ length: '', chest: '' })

export default function AddProductForm({ onBack, initialProduct }) {
  const { addProduct, updateProduct } = useProducts()
  const fileRef = useRef(null)

  const [name,        setName]        = useState(initialProduct?.name || '')
  const [color,       setColor]       = useState(initialProduct?.color || '#C8A97E')
  const [colorName,   setColorName]   = useState(initialProduct?.colorName || 'Beige Sablé')
  const [stockQty,    setStockQty]    = useState(initialProduct?.stockInitial || 1)
  const [units,       setUnits]       = useState(initialProduct?.units || [EMPTY_UNIT()])
  const [imageUrl,    setImageUrl]    = useState(initialProduct?.imageUrl || '')
  const [preview,     setPreview]     = useState(initialProduct?.imageUrl || null)
  const [dragging,    setDragging]    = useState(false)
  const [errors,      setErrors]      = useState({})
  const [success,     setSuccess]     = useState(false)
  const [uploading,   setUploading]   = useState(false)
  
  const [isScanning,  setScanning]    = useState(false)
  const prevUnitsRef  = useRef(units)

  /* ── Sync unit rows to stockQty ── */
  useEffect(() => {
    // If it's the initial render and we have initialProduct, don't overwrite units yet.
    // We only want to add/remove rows if stockQty changes *after* initial load.
    // Actually, stockQty is the source of truth for length.
    const qty = Math.max(1, Math.min(stockQty, 50))
    setUnits((prev) => {
      if (qty > prev.length) return [...prev, ...Array(qty - prev.length).fill(null).map(EMPTY_UNIT)]
      if (qty < prev.length) return prev.slice(0, qty)
      return prev
    })
  }, [stockQty])

  /* ── Detect completed unit measurements for scanning effect ── */
  useEffect(() => {
    const hasNew = units.some((u, i) => {
      const p = prevUnitsRef.current[i]
      return u.length && u.chest && (!p || p.length !== u.length || p.chest !== u.chest)
    })
    if (hasNew) {
      // Small delay to make it feel deliberate
      const delay = setTimeout(() => {
        setScanning(true)
        setTimeout(() => setScanning(false), 1000)
      }, 100)
      return () => clearTimeout(delay)
    }
    prevUnitsRef.current = units
  }, [units])

  /* ── Update a single unit field ── */
  const updateUnit = (idx, field, val) => {
    setUnits((prev) => prev.map((u, i) => i === idx ? { ...u, [field]: val } : u))
  }

  const addUnit = () => {
    if (units.length >= 50) return
    setUnits((prev) => [...prev, EMPTY_UNIT()])
    setStockQty((q) => q + 1)
  }

  const removeUnit = (idx) => {
    if (units.length <= 1) return
    setUnits((prev) => prev.filter((_, i) => i !== idx))
    setStockQty((q) => Math.max(1, q - 1))
  }

  /* ── Photo ── */
  const handlePhoto = async (file) => {
    if (!file || !file.type.startsWith('image/')) return
    
    // Immediate local preview
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(file)

    // Upload to Vercel Blob API
    setUploading(true)
    try {
      const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        body: file,
      });
      const data = await res.json();
      if (data.url) {
        setImageUrl(data.url)
      } else {
        console.error('Upload failed:', data.error)
      }
    } catch (e) {
      console.error('Upload error:', e)
    } finally {
      setUploading(false)
    }
  }

  /* ── Validation ── */
  const validate = () => {
    const e = {}
    if (!name.trim()) e.name = 'Nom requis'
    const badUnits = units.map((u, i) => {
      const errs = []
      if (!u.length || isNaN(parseFloat(u.length))) errs.push('longueur manquante')
      if (!u.chest  || isNaN(parseFloat(u.chest)))  errs.push('poitrine manquante')
      return errs.length ? `Pièce ${i + 1}: ${errs.join(', ')}` : null
    }).filter(Boolean)
    if (badUnits.length) e.units = badUnits
    setErrors(e)
    return Object.keys(e).length === 0
  }

  /* ── Submit ── */
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    
    // Add computed sizing to the units so they persist in the db
    const enrichedUnits = units.map(u => ({
      ...u,
      sizing: computeSize(u.length, u.chest)
    }))

    if (initialProduct) {
      updateProduct(initialProduct.id, { name, color, colorName, stockInitial: enrichedUnits.length, units: enrichedUnits, imageUrl })
    } else {
      addProduct({ name, color, colorName, stockInitial: enrichedUnits.length, units: enrichedUnits, imageUrl })
    }
    setSuccess(true)
    setTimeout(onBack, 1600)
  }

  /* ── Success screen ── */
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] gap-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 10 }}>
          <CheckCircle2 size={72} className="text-green-400" style={{ filter: 'drop-shadow(0 0 24px #22c55e)' }} />
        </motion.div>
        <p className="text-xl font-bold text-green-400">{initialProduct ? 'Gandoura modifié !' : 'Gandoura ajouté !'}</p>
        <p className="text-white/35 text-sm font-mono">{units.length} pièce{units.length > 1 ? 's' : ''} enregistrée{units.length > 1 ? 's' : ''}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Header */}
      <div className="flex items-center gap-4 mb-7">
        <motion.button
          type="button" onClick={onBack}
          whileHover={{ x: -3 }} whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 text-sm text-white/40 hover:text-cyan-neon transition-colors"
        >
          <ArrowLeft size={16} /> Retour
        </motion.button>
        <div>
          <h1 className="text-xl font-bold text-gradient-cyan text-glow">{initialProduct ? 'Modifier Gandoura' : 'Nouveau Gandoura'}</h1>
          <p className="text-xs text-white/30 font-mono mt-0.5">
            Taille calculée automatiquement · {units.length} pièce{units.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-5xl">

        {/* ══ LEFT COLUMN ══ */}
        <div className="space-y-5">

          {/* Photo Upload */}
          <div>
            <label className="label-glass">Photo du Produit</label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); handlePhoto(e.dataTransfer.files[0]) }}
              onClick={() => fileRef.current?.click()}
              className="relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 w-48 aspect-[3/4]"
              style={{
                border: `2px dashed ${dragging ? 'rgba(0,242,255,0.6)' : 'rgba(0,242,255,0.15)'}`,
                background: dragging ? 'rgba(0,242,255,0.05)' : 'rgba(255,255,255,0.02)',
              }}
            >
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => handlePhoto(e.target.files[0])} />

              {/* Scanning Overlay */}
              <AnimatePresence>
                {isScanning && (
                  <motion.div
                    key="scanner"
                    initial={{ y: '-100%' }}
                    animate={{ y: '100%' }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, ease: 'linear' }}
                    className="absolute inset-0 z-20 pointer-events-none"
                    style={{
                      height: '50%',
                      background: 'linear-gradient(to bottom, transparent, rgba(0,242,255,0.4))',
                      borderBottom: '2px solid #00f2ff',
                      boxShadow: '0 4px 20px rgba(0,242,255,0.6)'
                    }}
                  />
                )}
              </AnimatePresence>

              {preview ? (
                <>
                  <img src={preview} alt="preview" className={`w-full h-full object-cover transition-opacity duration-300 ${uploading ? 'opacity-50' : 'opacity-100'}`} />
                  {uploading ? (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="w-5 h-5 border-2 border-cyan-neon/30 border-t-cyan-neon rounded-full animate-spin" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/50 transition-all flex items-center justify-center opacity-0 hover:opacity-100 z-10">
                      <span className="text-white text-xs font-semibold bg-black/40 px-3 py-1.5 rounded-xl">
                        Changer la photo
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setPreview(null); setImageUrl('') }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center text-white/60 hover:text-white hover:bg-red-600 transition-all z-30"
                  >
                    <X size={12} />
                  </button>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2.2, repeat: Infinity }}>
                    <ImagePlus size={30} className="text-cyan-neon/25" />
                  </motion.div>
                  <div className="text-center">
                    <p className="text-sm text-white/35">Déposer une photo ici</p>
                    <p className="text-xs text-white/20 font-mono mt-0.5">ou cliquer pour parcourir</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="label-glass" htmlFor="pname">Nom du Produit *</label>
            <input
              id="pname" type="text"
              className={`input-glass ${errors.name ? 'border-red-500/40' : ''}`}
              placeholder="ex: Gandoura Prestige Blanc"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Color */}
          <div>
            <label className="label-glass">Couleur</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.hex} type="button"
                  onClick={() => { setColor(c.hex); setColorName(c.name) }}
                  title={c.name}
                  className="w-8 h-8 rounded-xl transition-all duration-200 flex-shrink-0"
                  style={{
                    backgroundColor: c.hex,
                    boxShadow: color === c.hex
                      ? `0 0 0 2px #05070a, 0 0 0 3.5px ${c.hex}, 0 0 10px ${c.hex}66`
                      : 'none',
                    transform: color === c.hex ? 'scale(1.18)' : 'scale(1)',
                  }}
                />
              ))}
              <label
                className="w-8 h-8 rounded-xl cursor-pointer flex items-center justify-center flex-shrink-0"
                style={{ border: '1.5px dashed rgba(0,242,255,0.25)', background: 'rgba(0,242,255,0.04)' }}
                title="Couleur personnalisée"
              >
                <span className="text-cyan-neon/50 text-base leading-none select-none">+</span>
                <input type="color" className="opacity-0 absolute w-0 h-0"
                  onChange={(e) => { setColor(e.target.value); setColorName('Personnalisé') }} />
              </label>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full ring-1 ring-white/15" style={{ backgroundColor: color }} />
              <span className="text-xs text-white/30 font-mono">{colorName}</span>
            </div>
          </div>

          {/* Size reference */}
          <details className="group">
            <summary className="cursor-pointer text-xs text-white/25 hover:text-cyan-neon/50 font-mono flex items-center gap-1 transition-colors list-none select-none">
              <ChevronDown size={12} className="group-open:rotate-180 transition-transform" />
              Tableau de correspondance des tailles
            </summary>
            <div className="mt-2 rounded-xl overflow-hidden border border-white/5 bg-white/5 p-2 space-y-3">
              {SIZE_RULES.map((tier) => (
                <div key={tier.profile}>
                  <p className="text-[10px] font-bold text-white/40 mb-1 uppercase tracking-wider pl-1">{tier.profile} Profile</p>
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <th className="text-left px-2 py-1.5 text-white/25 font-medium">Taille</th>
                        <th className="text-left px-2 py-1.5 text-white/25 font-medium">Poitrine</th>
                        <th className="text-left px-2 py-1.5 text-white/25 font-medium">Longueur</th>
                        <th className="text-left px-2 py-1.5 text-white/25 font-medium">Hauteur</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tier.rules.map((r) => (
                        <tr key={r.label} className="border-t border-white/4">
                          <td className="px-2 py-1.5 text-white/60 font-bold">{r.label}</td>
                          <td className="px-2 py-1.5 text-white/40">{r.chest}</td>
                          <td className="px-2 py-1.5 text-white/40">{r.length}</td>
                          <td className="px-2 py-1.5 text-white/40">{r.height}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </details>
        </div>

        {/* ══ RIGHT COLUMN ══ */}
        <div className="space-y-5">

          {/* Stock Qty control */}
          <div>
            <label className="label-glass">Nombre de Pièces (Stock Initial) *</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStockQty((q) => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white/50 hover:text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <Minus size={16} />
              </button>
              <input
                type="number"
                min="1"
                max="50"
                value={stockQty}
                onChange={(e) => setStockQty(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                className="input-glass font-mono text-center text-xl font-bold w-20"
                style={{ padding: '0.5rem' }}
              />
              <button
                type="button"
                onClick={() => setStockQty((q) => Math.min(50, q + 1))}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white/50 hover:text-cyan-neon transition-colors"
                style={{ background: 'rgba(0,242,255,0.05)', border: '1px solid rgba(0,242,255,0.15)' }}
              >
                <Plus size={16} />
              </button>
              <span className="text-xs text-white/30 font-mono">
                pièce{stockQty > 1 ? 's' : ''} → {units.length} ligne{units.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* ── Dynamic Unit Rows ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="label-glass mb-0">Mesures par Pièce</label>
              <span className="text-[10px] text-white/25 font-mono">
                {units.filter(u => u.length !== '' && u.chest !== '').length} / {units.length} remplie{units.length > 1 ? 's' : ''}
              </span>
            </div>

            <div
              className="rounded-2xl p-3 space-y-0 overflow-y-auto"
              style={{
                background: 'rgba(255,255,255,0.015)',
                border: '1px solid rgba(255,255,255,0.05)',
                maxHeight: '420px',
              }}
            >
              <AnimatePresence initial={false}>
                {units.map((unit, i) => (
                  <UnitRow
                    key={i}
                    index={i}
                    unit={unit}
                    onChange={updateUnit}
                    canRemove={units.length > 1}
                    onRemove={() => removeUnit(i)}
                  />
                ))}
              </AnimatePresence>

              {/* Add unit manually */}
              {units.length < 50 && (
                <button
                  type="button"
                  onClick={addUnit}
                  className="w-full mt-1 py-2 rounded-xl text-xs font-mono text-white/25 hover:text-cyan-neon transition-all flex items-center justify-center gap-1.5"
                  style={{ border: '1px dashed rgba(0,242,255,0.12)' }}
                >
                  <Plus size={11} /> Ajouter une pièce
                </button>
              )}
            </div>

            {errors.units && (
              <div className="mt-2 space-y-1">
                {errors.units.map((e) => (
                  <p key={e} className="text-red-400 text-xs font-mono flex items-center gap-1">
                    <AlertCircle size={10} /> {e}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button" onClick={onBack}
              className="flex-1 py-3 rounded-xl text-sm font-medium text-white/40 transition-all"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              Annuler
            </button>
            <motion.button
              type="submit"
              disabled={uploading}
              whileHover={!uploading ? { scale: 1.02 } : {}}
              whileTap={!uploading ? { scale: 0.97 } : {}}
              className={`flex-1 btn-cyan justify-center py-3 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Zap size={15} />
              {initialProduct ? 'Enregistrer les modifications' : `Ajouter ${units.length} pièce${units.length > 1 ? 's' : ''}`}
            </motion.button>
          </div>
        </div>
      </div>
    </form>
  )
}
