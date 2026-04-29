import AddProductForm from '../components/AddProductForm'

export default function AddPage({ onNavigate, editingProduct }) {
  return <AddProductForm onBack={() => onNavigate('dashboard')} initialProduct={editingProduct} />
}
