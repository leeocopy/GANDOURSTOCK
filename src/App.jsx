import { useState } from 'react'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { ProductProvider } from './hooks/useProducts'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import InventoryPage from './pages/InventoryPage'
import SoldPage from './pages/SoldPage'
import AddPage from './pages/AddPage'
import Layout from './components/Layout'

function AppRoutes() {
  const { user, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [editingProduct, setEditingProduct] = useState(null)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-neon/20 border-t-cyan-neon rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <LoginPage />

  const handleNavigate = (page, product = null) => {
    setEditingProduct(product)
    setCurrentPage(page)
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage onNavigate={handleNavigate} />
      case 'inventory': return <InventoryPage />
      case 'sold':      return <SoldPage onNavigate={handleNavigate} />
      case 'add':       return <AddPage onNavigate={handleNavigate} />
      case 'edit':      return <AddPage onNavigate={handleNavigate} editingProduct={editingProduct} />
      default:          return <DashboardPage onNavigate={handleNavigate} />
    }
  }

  return (
    <Layout currentPage={currentPage} onNavigate={handleNavigate}>
      {renderPage()}
    </Layout>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <AppRoutes />
      </ProductProvider>
    </AuthProvider>
  )
}
