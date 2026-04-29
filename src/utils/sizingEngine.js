/**
 * Automated Sizing Engine — Advanced Logic (V3)
 * Implements Multi-Tier Profiling based on Chest and Length.
 */

// Sizing reference tables for display purposes
export const SIZE_RULES = [
  { profile: 'Standard', rules: [
    { label: 'S',   chest: '28-30', length: '130-134', height: '1m60-1m65' },
    { label: 'M',   chest: '31-32', length: '135-138', height: '1m68-1m72' },
    { label: 'L',   chest: '33-34', length: '140-142', height: '1m75-1m78' },
    { label: 'XL',  chest: '35-36', length: '145-148', height: '1m80-1m85' },
    { label: 'XXL', chest: '38-40', length: '150-155', height: '1m88+' },
  ]},
  { profile: 'Long', rules: [
    { label: 'L (Long)',        chest: '30-31', length: '142-145', height: '1m75-1m80' },
    { label: 'XL (Extra Long)', chest: '32-33', length: '150-155', height: '1m85-1m90' },
    { label: 'XXL (Custom)',    chest: '34',    length: '160+',    height: '1m95+' },
  ]},
  { profile: 'Shortened', rules: [
    { label: 'XL (Shortened)',  chest: '35-37', length: '135-138', height: '1m65-1m70' },
    { label: 'XXL (Shortened)', chest: '38-40', length: '140-142', height: '1m70-1m75' },
    { label: '3XL+',            chest: '42+',   length: '145',     height: '1m75-1m80' },
  ]}
]

const STYLES = {
  Standard:  { bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.35)',  text: '#22c55e' }, // Green
  Long:      { bg: 'rgba(0,242,255,0.10)',  border: 'rgba(0,242,255,0.35)',  text: '#00f2ff' }, // Cyan
  Shortened: { bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.35)', text: '#a855f7' }, // Purple
  Custom:    { bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.35)', text: '#f59e0b' }, // Amber
}

function makeSize(profile, size, personHeight) {
  const isCustom = profile === 'Custom'
  return {
    profile,
    size,
    personHeight,
    isCustom,
    color: STYLES[profile]?.text || STYLES.Custom.text,
    style: STYLES[profile] || STYLES.Custom
  }
}

/** Compute sizing profile and exact size based on length and chest. */
export function computeSize(lenStr, chestStr) {
  const len = parseFloat(lenStr)
  const chest = parseFloat(chestStr)
  
  if (isNaN(len) || isNaN(chest)) return null

  // 1. Broad / Shortened Fit (Tier 3)
  if (chest >= 34.5) {
    if (chest >= 34.5 && chest <= 37.5 && len <= 139) {
      return makeSize('Shortened', 'XL (Shortened)', '1m65 - 1m70')
    }
    if (chest >= 37.5 && chest <= 41 && len <= 143) {
      return makeSize('Shortened', 'XXL (Shortened)', '1m70 - 1m75')
    }
    if (chest >= 41.5) {
      return makeSize('Shortened', '3XL+', '1m75 - 1m80')
    }
  }

  // 2. Tall / Slim Fit (Tier 2)
  if (len >= 142 && chest <= 34.5) {
    if (chest <= 31.5 && len <= 148) {
      return makeSize('Long', 'L (Long)', '1m75 - 1m80')
    }
    if (chest >= 31.5 && chest <= 33.5 && len >= 149 && len <= 158) {
      return makeSize('Long', 'XL (Extra Long)', '1m85 - 1m90')
    }
    if (len >= 159) {
      return makeSize('Long', 'XXL (Custom)', '1m95+')
    }
  }

  // 3. Global Standard (Tier 1)
  if (chest <= 30.5 && len <= 134.5) return makeSize('Standard', 'S', '1m60 - 1m65')
  if (chest >= 30.5 && chest <= 32.5 && len >= 134.5 && len <= 139) return makeSize('Standard', 'M', '1m68 - 1m72')
  if (chest >= 32.5 && chest <= 34.5 && len >= 139 && len <= 143.5) return makeSize('Standard', 'L', '1m75 - 1m78')
  if (chest >= 34.5 && chest <= 37.5 && len >= 144 && len <= 149) return makeSize('Standard', 'XL', '1m80 - 1m85')
  if (chest >= 37.5 && len >= 149) return makeSize('Standard', 'XXL', '1m88+')

  // Fallback
  return makeSize('Custom', 'Custom', 'Spéciale')
}

/**
 * Compute the dominant profile/size for a product with multiple units.
 */
export function dominantSize(units = []) {
  if (!units.length) return makeSize('Custom', '—', '—')
  
  const counts = {}
  for (const u of units) {
    if (!u.sizing) continue
    const key = `${u.sizing.profile}|${u.sizing.size}`
    counts[key] = (counts[key] || 0) + 1
  }
  
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1])
  if (!entries.length) return makeSize('Custom', '—', '—')
  
  const dominantKey = entries[0][0]
  const isMixed = entries.length > 1

  if (isMixed) {
    return makeSize('Custom', 'Mix', 'Multiples')
  }

  const [prof, sz] = dominantKey.split('|')
  return makeSize(prof, sz, '')
}

/** Compute remaining stock. */
export function computeRemaining(stockInitial, stockSold) {
  const init = parseInt(stockInitial, 10) || 0
  const sold = parseInt(stockSold, 10)    || 0
  return Math.max(0, init - sold)
}

/** Stock status for UI indicators. */
export function getStockStatus(remaining, initial) {
  const ratio = initial > 0 ? remaining / initial : 0
  if (remaining === 0)  return { label: 'Épuisé',    color: '#ef4444', indicator: 'stock-indicator-low'  }
  if (ratio <= 0.3)     return { label: 'Stock Bas', color: '#f59e0b', indicator: 'stock-indicator-low'  }
  return                       { label: 'En Stock',  color: '#22c55e', indicator: 'stock-indicator-high' }
}
