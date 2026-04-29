// Local JSON store — migrated to units[] model (v2)
// Each product has a 'units' array: one entry per physical piece.

const STORAGE_KEY = 'gandoura_products_v2'

const SAMPLE_DATA = [
  {
    id: 'gnd-001',
    name: 'Gandoura Classique Beige',
    color: '#C8A97E',
    colorName: 'Beige Sablé',
    stockInitial: 3,
    stockSold: 1,
    imageUrl: '',
    createdAt: '2026-04-01T10:00:00Z',
    units: [
      { length: 143, chest: 118, size: 'L',   personHeight: '1m75 - 1m80', shoulder: '48 - 50 cm' },
      { length: 144, chest: 120, size: 'L',   personHeight: '1m75 - 1m80', shoulder: '48 - 50 cm' },
      { length: 152, chest: 124, size: 'XL',  personHeight: '1m85 - 1m90', shoulder: '52 - 54 cm' },
    ],
  },
  {
    id: 'gnd-002',
    name: 'Gandoura Prestige Blanc',
    color: '#F5F0E8',
    colorName: 'Blanc Ivoire',
    stockInitial: 2,
    stockSold: 1,
    imageUrl: '',
    createdAt: '2026-04-05T10:00:00Z',
    units: [
      { length: 152, chest: 124, size: 'XL',  personHeight: '1m85 - 1m90', shoulder: '52 - 54 cm' },
      { length: 162, chest: 132, size: 'XXL', personHeight: '1m95+',        shoulder: '56 - 58 cm' },
    ],
  },
  {
    id: 'gnd-003',
    name: 'Gandoura Royal Noir',
    color: '#1a1a2e',
    colorName: 'Noir Profond',
    stockInitial: 4,
    stockSold: 0,
    imageUrl: '',
    createdAt: '2026-04-10T10:00:00Z',
    units: [
      { length: 162, chest: 132, size: 'XXL', personHeight: '1m95+', shoulder: '56 - 58 cm' },
      { length: 163, chest: 134, size: 'XXL', personHeight: '1m95+', shoulder: '56 - 58 cm' },
      { length: 165, chest: 136, size: 'XXL', personHeight: '1m95+', shoulder: '56 - 58 cm' },
      { length: 160, chest: 130, size: 'XXL', personHeight: '1m95+', shoulder: '56 - 58 cm' },
    ],
  },
  {
    id: 'gnd-004',
    name: 'Gandoura Sultan Gris',
    color: '#6B7280',
    colorName: 'Gris Acier',
    stockInitial: 2,
    stockSold: 0,
    imageUrl: '',
    createdAt: '2026-04-15T10:00:00Z',
    units: [
      { length: 153, chest: 126, size: 'XL', personHeight: '1m85 - 1m90', shoulder: '52 - 54 cm' },
      { length: 154, chest: 128, size: 'XL', personHeight: '1m85 - 1m90', shoulder: '52 - 54 cm' },
    ],
  },
]

export function loadProducts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to load products', e)
  }
  saveProducts(SAMPLE_DATA)
  return SAMPLE_DATA
}

export function saveProducts(products) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
  } catch (e) {
    console.error('Failed to save products', e)
  }
}

export function generateId() {
  return `gnd-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}
