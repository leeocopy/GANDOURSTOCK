import { useState, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import { computeRemaining, getStockStatus, dominantSize } from '../utils/sizingEngine'
import { Trash2, ShoppingBag, ImageOff, Layers, Edit, Download, ChevronLeft, ChevronRight } from 'lucide-react'

const FLOAT_CONFIGS = [
  { y: 7,  dur: 5.8, delay: 0   },
  { y: 9,  dur: 6.6, delay: 1.2 },
  { y: 6,  dur: 5.2, delay: 2.4 },
  { y: 10, dur: 7.1, delay: 0.6 },
  { y: 8,  dur: 6.2, delay: 1.8 },
  { y: 7,  dur: 5.5, delay: 3.0 },
]

function GlowBurst({ trigger, color }) {
  return (
    <AnimatePresence>
      {trigger && (
        <motion.div
          key={trigger}
          className="pointer-events-none absolute inset-0 rounded-3xl z-20"
          initial={{ opacity: 0.9 }}
          animate={{ opacity: 0 }}
          exit={{}}
          transition={{ duration: 0.6 }}
          style={{ background: `radial-gradient(circle at 50% 80%, ${color}22 0%, transparent 70%)` }}
        />
      )}
    </AnimatePresence>
  )
}

/* Compact lengths summary for multi-unit products */
function LengthsSummary({ units }) {
  if (!units || units.length === 0) return null
  const lengths = units.map(u => u.length).filter(Boolean)
  const unique   = [...new Set(lengths)].sort((a, b) => a - b)
  const allSame  = unique.length === 1

  if (allSame) return (
    <span className="text-sm text-white/60 font-mono font-medium">Long. uniforme: {unique[0]} cm</span>
  )

  const display = unique.slice(0, 4).join(', ')
  const more    = unique.length > 4 ? ` +${unique.length - 4}` : ''
  return (
    <span className="text-sm text-white/60 font-mono font-medium flex items-center gap-1.5 mt-0.5">
      <Layers size={14} />
      {display}{more} cm
    </span>
  )
}

/* Size breakdown pills when mixed */
function SizeBreakdown({ units }) {
  if (!units || units.length === 0) return null
  const counts = {}
  const styles = {}
  for (const u of units) {
    const s = u.size || 'Custom'
    counts[s] = (counts[s] || 0) + 1
    if (u.sizing && u.sizing.style) styles[s] = u.sizing.style
  }
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1])
  if (entries.length <= 1) return null

  return (
    <div className="flex flex-wrap gap-1.5 mb-1">
      {entries.map(([size, count]) => {
        const st = styles[size] || { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', text: '#f59e0b' }
        return (
          <span
            key={size}
            className="text-xs font-mono font-bold px-2 py-0.5 rounded-md"
            style={{ background: st.bg, border: `1px solid ${st.border}`, color: st.text }}
          >
            {size}×{count}
          </span>
        )
      })}
    </div>
  )
}

export default function ProductCard({ product, index, onDelete, onSellOne, onEdit }) {
  const remaining  = computeRemaining(product.stockInitial, product.stockSold)
  const status     = getStockStatus(remaining, product.stockInitial)
  const stockPct   = product.stockInitial > 0 ? (remaining / product.stockInitial) * 100 : 0
  const floatCfg   = FLOAT_CONFIGS[index % FLOAT_CONFIGS.length]
  const dominant   = dominantSize(product.units || [])
  const sizeSt     = dominant.style
  const isMixed    = dominant.size === 'Mix'
  const isSoldOut  = remaining === 0
  const hasImage   = !!product.imageUrl

  const [burstKey,      setBurstKey]      = useState(null)
  const [sellDisabled,  setSellDisabled]  = useState(false)
  const [imgIndex,      setImgIndex]      = useState(0)
  const [showSellModal, setShowSellModal] = useState(false)
  const [sellPrice,     setSellPrice]     = useState('')
  const [selectedUnit,  setSelectedUnit]  = useState(null)

  const urls = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls : (product.imageUrl ? [product.imageUrl] : [])
  const currentImg = urls[imgIndex]
  const hasImages = urls.length > 0

  // Build list of selectable units from product.units
  const availableUnits = (product.units || []).map((u, i) => ({
    index:        i,
    size:         u.size         || 'Custom',
    personHeight: u.personHeight || '—',
    profile:      u.profile      || '—',
    length:       u.length       || '—',
    chest:        u.chest        || '—',
  }))

  const handleDownload = async (e) => {
    e.stopPropagation()
    if (!currentImg) return
    try {
      const response = await fetch(currentImg)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `gandoura-${product.id}-${imgIndex}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download failed', err)
      window.open(currentImg, '_blank')
    }
  }

  const nextImg = (e) => { e.stopPropagation(); setImgIndex((prev) => (prev + 1) % urls.length) }
  const prevImg = (e) => { e.stopPropagation(); setImgIndex((prev) => (prev - 1 + urls.length) % urls.length) }

  /* 3-D tilt */
  const cardRef  = useRef(null)
  const rotateX  = useMotionValue(0)
  const rotateY  = useMotionValue(0)
  const springX  = useSpring(rotateX, { stiffness: 180, damping: 22 })
  const springY  = useSpring(rotateY, { stiffness: 180, damping: 22 })

  const onMove = (e) => {
    const r  = cardRef.current?.getBoundingClientRect()
    if (!r) return
    rotateX.set(((e.clientY - r.top  - r.height / 2) / r.height) * -8)
    rotateY.set(((e.clientX - r.left - r.width  / 2) / r.width ) *  8)
  }
  const onLeave = () => { rotateX.set(0); rotateY.set(0) }

  const handleSell = () => {
    if (isSoldOut || sellDisabled) return
    // Auto-select if only one unit
    setSelectedUnit(availableUnits.length === 1 ? availableUnits[0] : null)
    setSellPrice('')
    setShowSellModal(true)
  }

  const confirmSell = () => {
    if (availableUnits.length > 0 && !selectedUnit) {
      alert('Veuillez choisir la taille / unité vendue.')
      return
    }
    const price = parseFloat(sellPrice) || 0
    if (price <= 0) {
      alert('Veuillez entrer un prix de vente valide.')
      return
    }
    setBurstKey(Date.now())
    setSellDisabled(true)
    onSellOne(product.id, price, selectedUnit?.size || null, selectedUnit?.index ?? null)
    setShowSellModal(false)
    setSellPrice('')
    setSelectedUnit(null)
    setTimeout(() => setSellDisabled(false), 650)
  }


  return (
    <motion.div
      ref={cardRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        rotateX: springX,
        rotateY: springY,
        transformPerspective: 900,
        transformStyle: 'preserve-3d',
        background: 'rgba(255,255,255,0.034)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
      }}
      animate={{ y: [0, -floatCfg.y, 0] }}
      transition={{ y: { duration: floatCfg.dur, delay: floatCfg.delay, repeat: Infinity, ease: 'easeInOut' } }}
      initial={{ opacity: 0, y: 40, scale: 0.93 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      className="group relative flex flex-col rounded-3xl overflow-hidden cursor-default"
    >
      {/* Hover border */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ boxShadow: `inset 0 0 0 1px ${sizeSt.border}` }}
      />

      <GlowBurst trigger={burstKey} color={sizeSt.text} />

      {/* ── IMAGE PANEL ── */}
      <div
        className="relative w-full aspect-[3/4] flex-shrink-0 overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${product.color}18, rgba(0,0,0,0.35))` }}
      >
        {hasImages ? (
          <>
            <img
              src={currentImg}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Carousel Controls */}
            {urls.length > 1 && (
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button onClick={prevImg} className="p-1.5 rounded-full bg-black/50 text-white/70 hover:text-white hover:bg-black/80 backdrop-blur-sm">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={nextImg} className="p-1.5 rounded-full bg-black/50 text-white/70 hover:text-white hover:bg-black/80 backdrop-blur-sm">
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
            {/* Image Dots */}
            {urls.length > 1 && (
              <div className="absolute bottom-16 inset-x-0 flex justify-center gap-1 z-20">
                {urls.map((_, i) => (
                  <div key={i} className={`w-1 h-1 rounded-full transition-all ${i === imgIndex ? 'bg-cyan-neon w-3' : 'bg-white/30'}`} />
                ))}
              </div>
            )}
            {/* Download Button */}
            <motion.button
              onClick={handleDownload}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-3 left-3 z-30 w-8 h-8 flex items-center justify-center rounded-xl bg-black/40 text-white/60 hover:text-cyan-neon hover:bg-black/60 backdrop-blur-md border border-white/5 opacity-0 group-hover:opacity-100 transition-all"
              title="Télécharger l'image"
            >
              <Download size={14} />
            </motion.button>
          </>
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center gap-3"
            style={{ background: `linear-gradient(135deg, ${product.color}28, ${product.color}08)` }}
          >
            <div className="w-16 h-16 rounded-2xl shadow-lg ring-1 ring-white/10"
              style={{ backgroundColor: product.color }} />
            <span className="flex items-center gap-1.5 text-white/20">
              <ImageOff size={11} />
              <span className="text-[10px] font-mono uppercase tracking-wider">Aucune photo</span>
            </span>
          </div>
        )}

        {/* Profile tag top-left (moved down slightly to not conflict with download) */}
        {dominant.profile && dominant.profile !== '—' && (
          <div
            className="absolute top-13 left-3 z-10 px-2 py-1 rounded-lg flex items-center"
            style={{ background: 'rgba(5,7,10,0.6)', backdropFilter: 'blur(8px)', border: `1px solid ${sizeSt.border}`, marginTop: '34px' }}
          >
            <span className="text-[9px] font-bold font-mono tracking-wider uppercase" style={{ color: sizeSt.text }}>
              Profil {dominant.profile}
            </span>
          </div>
        )}

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(5,7,10,0.95), transparent)' }} />

        {/* ── FLOATING NEON STOCK BADGE ── */}
        <motion.div
          animate={{
            y: [0, -4, 0],
            boxShadow: [
              `0 4px 16px rgba(0,0,0,0.4), 0 0 10px ${sizeSt.text}33`,
              `0 8px 24px rgba(0,0,0,0.5), 0 0 22px ${sizeSt.text}55`,
              `0 4px 16px rgba(0,0,0,0.4), 0 0 10px ${sizeSt.text}33`,
            ],
          }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-3 right-3 z-10 flex flex-col items-center px-3 py-2 rounded-2xl"
          style={{
            background: sizeSt.bg,
            border: `1px solid ${sizeSt.border}`,
            backdropFilter: 'blur(10px)',
          }}
        >
          <span className="text-2xl font-black leading-none font-mono" style={{ color: sizeSt.text }}>
            {remaining}
          </span>
          <span className="text-[9px] font-mono tracking-widest uppercase mt-0.5" style={{ color: `${sizeSt.text}88` }}>
            restant
          </span>
        </motion.div>

        {/* Size / label badge bottom-left */}
        <div
          className="absolute bottom-3 left-3 z-10 px-2.5 py-1 rounded-xl flex items-center gap-1.5"
          style={{ background: 'rgba(5,7,10,0.8)', backdropFilter: 'blur(8px)', border: `1px solid ${sizeSt.border}` }}
        >
          <span className="text-xs font-black font-mono tracking-widest" style={{ color: sizeSt.text }}>
            {dominant.size}
          </span>
          {isMixed && <span className="text-[9px] text-white/40 font-mono">tailles</span>}
        </div>

        {/* Unit count badge */}
        {product.units && product.units.length > 1 && (
          <div
            className="absolute bottom-3 right-3 z-10 px-2 py-1 rounded-xl"
            style={{ background: 'rgba(5,7,10,0.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <span className="text-[9px] font-mono text-white/40">{product.units.length} pcs</span>
          </div>
        )}
      </div>

      {/* ── BODY ── */}
      <div className="flex flex-col flex-1 p-4 gap-3">

        {/* Name + color dot */}
        <div className="flex items-start gap-2.5">
          <div className="w-3.5 h-3.5 rounded-full flex-shrink-0 mt-1 ring-1 ring-white/10"
            style={{ backgroundColor: product.color }} />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white/90 leading-snug line-clamp-2">{product.name}</h3>
            <p className="text-[11px] text-white/30 mt-0.5 font-mono">{product.colorName}</p>
          </div>
        </div>

        {/* Size breakdown (if mixed) / lengths summary */}
        <div className="space-y-1.5">
          {isMixed && <SizeBreakdown units={product.units} />}
          <LengthsSummary units={product.units} />
        </div>

        {/* Stock bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className={status.indicator} />
              <span className="text-[10px] font-medium" style={{ color: status.color }}>{status.label}</span>
            </div>
            <span className="text-[10px] text-white/25 font-mono">{product.stockSold} vendu{product.stockSold !== 1 ? 's' : ''}</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${stockPct}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: index * 0.05 }}
              style={{
                background: stockPct > 50
                  ? 'linear-gradient(90deg,#22c55e,#4ade80)'
                  : stockPct > 20
                  ? 'linear-gradient(90deg,#f59e0b,#fbbf24)'
                  : 'linear-gradient(90deg,#ef4444,#f87171)',
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-white/20 font-mono">Initial: {product.stockInitial}</span>
            <span className="text-[9px] text-white/20 font-mono">{Math.round(stockPct)}%</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1 border-t border-white/5 mt-auto">
          {/* SELL 1 */}
          <motion.button
            onClick={handleSell}
            disabled={isSoldOut || sellDisabled}
            whileHover={!isSoldOut ? { scale: 1.03 } : {}}
            whileTap={!isSoldOut   ? { scale: 0.95 } : {}}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold tracking-wide relative overflow-hidden transition-all duration-200"
            style={isSoldOut ? {
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.18)',
              cursor: 'not-allowed',
            } : {
              background: sizeSt.bg,
              border: `1px solid ${sizeSt.border}`,
              color: sizeSt.text,
              boxShadow: sellDisabled ? `0 0 20px ${sizeSt.text}40` : 'none',
            }}
          >
            <AnimatePresence>
              {sellDisabled && !isSoldOut && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{ x: '-100%' }} animate={{ x: '200%' }}
                  transition={{ duration: 0.5 }}
                  style={{ background: `linear-gradient(90deg, transparent, ${sizeSt.text}28, transparent)` }}
                />
              )}
            </AnimatePresence>
            <ShoppingBag size={13} />
            {isSoldOut ? 'Épuisé' : 'Vendre × 1'}
          </motion.button>

          {/* Edit */}
          {onEdit && (
            <motion.button
              onClick={(e) => { e.preventDefault(); onEdit(product); }}
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
              className="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200"
              style={{ background: 'rgba(0,242,255,0.06)', border: '1px solid rgba(0,242,255,0.12)', color: 'rgba(0,242,255,0.45)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,242,255,0.15)'; e.currentTarget.style.color = '#00f2ff' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,242,255,0.06)'; e.currentTarget.style.color = 'rgba(0,242,255,0.45)' }}
              title="Modifier ce produit"
            >
              <Edit size={15} />
            </motion.button>
          )}

          {/* Delete */}
          <motion.button
            onClick={(e) => { e.preventDefault(); onDelete(product.id); }}
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
            className="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200"
            style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)', color: 'rgba(239,68,68,0.45)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#ef4444' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; e.currentTarget.style.color = 'rgba(239,68,68,0.45)' }}
            title="Supprimer ce produit"
          >
            <Trash2 size={16} />
          </motion.button>
        </div>
      </div>
      {/* ── SELL MODAL ── */}
      <AnimatePresence>
        {showSellModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowSellModal(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 24 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className="relative w-full max-w-md glass-card p-6 shadow-2xl"
              style={{ border: '1px solid rgba(0,242,255,0.2)' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(0,242,255,0.1)', border: '1px solid rgba(0,242,255,0.2)' }}>
                  <ShoppingBag size={17} className="text-cyan-neon" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white leading-tight">{product.name}</h3>
                  <p className="text-[10px] text-white/30 font-mono uppercase tracking-wider mt-0.5">
                    Enregistrer une vente
                  </p>
                </div>
              </div>

              <div className="space-y-5">

                {/* ── STEP 1: Choose size unit ── */}
                {availableUnits.length > 0 && (
                  <div>
                    <p className="text-[10px] text-white/40 font-mono uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-cyan-neon/20 text-cyan-neon text-[9px] flex items-center justify-center font-bold">1</span>
                      Quelle taille a été vendue ?
                    </p>

                    <div className="grid gap-2 max-h-52 overflow-y-auto pr-1"
                      style={{ gridTemplateColumns: availableUnits.length <= 3 ? `repeat(${availableUnits.length}, 1fr)` : 'repeat(3, 1fr)' }}>
                      {availableUnits.map((u) => {
                        const sizeColors = {
                          L:    { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)', text: '#f59e0b' },
                          XL:   { bg: 'rgba(0,242,255,0.10)',  border: 'rgba(0,242,255,0.30)',  text: '#00f2ff' },
                          XXL:  { bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.35)', text: '#a855f7' },
                          Custom:{ bg: 'rgba(255,255,255,0.06)',border: 'rgba(255,255,255,0.15)',text: '#ffffff99' },
                        }
                        const st = sizeColors[u.size] || sizeColors.Custom
                        const isSelected = selectedUnit?.index === u.index

                        return (
                          <motion.button
                            key={u.index}
                            onClick={() => setSelectedUnit(u)}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="flex flex-col items-center p-3 rounded-xl text-center transition-all relative"
                            style={isSelected ? {
                              background: st.bg,
                              border: `1.5px solid ${st.text}`,
                              boxShadow: `0 0 16px ${st.text}30`,
                            } : {
                              background: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(255,255,255,0.08)',
                            }}
                          >
                            {/* Selected checkmark */}
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }} animate={{ scale: 1 }}
                                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black"
                                style={{ background: st.text, color: '#000' }}
                              >
                                ✓
                              </motion.div>
                            )}

                            {/* Size badge */}
                            <span className="text-lg font-black font-mono leading-none mb-1.5"
                              style={{ color: isSelected ? st.text : 'rgba(255,255,255,0.5)' }}>
                              {u.size}
                            </span>

                            {/* Height */}
                            <span className="text-[9px] font-mono text-white/30 leading-tight">{u.personHeight}</span>

                            {/* Profile */}
                            {u.profile !== '—' && (
                              <span className="text-[8px] font-mono mt-0.5 px-1.5 py-0.5 rounded-md"
                                style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.25)' }}>
                                {u.profile}
                              </span>
                            )}

                            {/* Measurements */}
                            <div className="mt-1.5 text-[8px] font-mono text-white/20 space-y-0.5">
                              {u.length !== '—' && <div>L: {u.length} cm</div>}
                              {u.chest  !== '—' && <div>P: {u.chest} cm</div>}
                            </div>
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* ── STEP 2: Price ── */}
                <div>
                  <p className="text-[10px] text-white/40 font-mono uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-cyan-neon/20 text-cyan-neon text-[9px] flex items-center justify-center font-bold">
                      {availableUnits.length > 0 ? '2' : '1'}
                    </span>
                    Prix de vente (DH)
                  </p>
                  <div className="relative">
                    <input
                      autoFocus={availableUnits.length === 0 || (availableUnits.length === 1)}
                      type="number"
                      min="0"
                      value={sellPrice}
                      onChange={e => setSellPrice(e.target.value)}
                      placeholder="ex: 150"
                      className="input-glass w-full text-center text-2xl font-black py-3.5 font-mono"
                      style={{ letterSpacing: '0.05em' }}
                      onKeyDown={e => e.key === 'Enter' && confirmSell()}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-white/20 font-mono">DH</span>
                  </div>

                  {/* Profit preview */}
                  {parseFloat(sellPrice) > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                      className="mt-2 flex justify-between text-[10px] font-mono px-1"
                    >
                      <span className="text-white/25">Coût fixe: <span className="text-white/40">50 DH</span></span>
                      <span className={parseFloat(sellPrice) - 50 >= 0 ? 'text-green-400' : 'text-red-400'}>
                        Bénéfice: {Math.round(parseFloat(sellPrice) - 50)} DH
                      </span>
                    </motion.div>
                  )}
                </div>

                {/* Summary line */}
                {selectedUnit && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-mono text-white/40"
                    style={{ background: 'rgba(0,242,255,0.04)', border: '1px solid rgba(0,242,255,0.1)' }}
                  >
                    <ShoppingBag size={11} className="text-cyan-neon/50" />
                    Taille sélectionnée:
                    <span className="text-cyan-neon font-bold">{selectedUnit.size}</span>
                    {selectedUnit.personHeight !== '—' && (
                      <span className="text-white/25">· {selectedUnit.personHeight}</span>
                    )}
                  </motion.div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => { setShowSellModal(false); setSelectedUnit(null); setSellPrice('') }}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white/35 hover:text-white/70 transition-colors border border-white/6 hover:border-white/12"
                  >
                    Annuler
                  </button>
                  <motion.button
                    onClick={confirmSell}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background: (selectedUnit || availableUnits.length === 0) && parseFloat(sellPrice) > 0
                        ? 'linear-gradient(135deg,#00f2ff,#0099ff)'
                        : 'rgba(255,255,255,0.06)',
                      color: (selectedUnit || availableUnits.length === 0) && parseFloat(sellPrice) > 0
                        ? '#000'
                        : 'rgba(255,255,255,0.2)',
                    }}
                  >
                    Confirmer la vente
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
