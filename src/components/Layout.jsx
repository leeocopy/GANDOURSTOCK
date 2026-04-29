import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import {
  LayoutDashboard, Package, PlusCircle, LogOut,
  Zap, ChevronLeft, ChevronRight, Menu, X
} from 'lucide-react'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'inventory', label: 'Inventaire', icon: Package },
  { id: 'add', label: 'Ajouter', icon: PlusCircle },
]

export default function Layout({ currentPage, onNavigate, children }) {
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className={`flex items-center gap-3 px-4 py-5 mb-2 ${collapsed ? 'justify-center' : ''}`}>
        <motion.div
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(0,242,255,0.1)', border: '1px solid rgba(0,242,255,0.2)' }}
          animate={{ boxShadow: ['0 0 6px rgba(0,242,255,0.1)', '0 0 18px rgba(0,242,255,0.3)', '0 0 6px rgba(0,242,255,0.1)'] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <Zap size={18} className="text-cyan-neon" />
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-sm font-bold text-gradient-cyan leading-none">Gandoura</p>
              <p className="text-[10px] text-white/30 font-mono tracking-widest">STOCK MGR</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <hr className="neon-divider mx-3 my-0" />

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = currentPage === id
          return (
            <motion.button
              key={id}
              onClick={() => { onNavigate(id); setMobileOpen(false) }}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.97 }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                collapsed ? 'justify-center' : ''
              } ${
                active
                  ? 'bg-cyan-neon/10 text-cyan-neon border border-cyan-neon/25 shadow-cyan-glow-sm'
                  : 'text-white/50 hover:text-white/90 hover:bg-white/5 border border-transparent'
              }`}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className="flex-shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
              {active && !collapsed && (
                <motion.div
                  layoutId="active-indicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-neon"
                  style={{ boxShadow: '0 0 6px #00f2ff' }}
                />
              )}
            </motion.button>
          )
        })}
      </nav>

      {/* User / Logout */}
      <div className="px-3 pb-4">
        <hr className="neon-divider" />
        <div className={`flex items-center gap-3 px-2 mb-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-7 h-7 rounded-full bg-cyan-neon/10 border border-cyan-neon/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-cyan-neon">A</span>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-xs font-semibold text-white/80 truncate">{user?.username}</p>
                <p className="text-[10px] text-white/30 font-mono">Owner</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <motion.button
          onClick={logout}
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.97 }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-white/40 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Déconnexion' : undefined}
        >
          <LogOut size={15} className="flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Déconnexion
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Collapse toggle (desktop) */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full items-center justify-center text-white/40 hover:text-cyan-neon transition-colors"
        style={{ background: '#0d1117', border: '1px solid rgba(0,242,255,0.2)' }}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-bg-deep">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 220 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="hidden lg:block flex-shrink-0 relative h-screen sticky top-0"
        style={{
          background: 'rgba(255,255,255,0.02)',
          borderRight: '1px solid rgba(0,242,255,0.08)',
        }}
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 25 }}
              className="lg:hidden fixed left-0 top-0 h-full w-56 z-50 relative"
              style={{ background: '#0a0c10', borderRight: '1px solid rgba(0,242,255,0.12)' }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6 py-4"
          style={{ background: 'rgba(5,7,10,0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,242,255,0.06)' }}>
          {/* Mobile menu button */}
          <button
            className="lg:hidden text-white/60 hover:text-cyan-neon transition-colors"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={20} />
          </button>

          {/* Page title */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-white/20 hidden sm:block">SYS://</span>
            <h2 className="text-sm font-semibold text-white/70 capitalize">
              {NAV_ITEMS.find((n) => n.id === currentPage)?.label || currentPage}
            </h2>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="stock-indicator-high" />
              <span className="text-[10px] font-mono text-white/30 hidden sm:block">ONLINE</span>
            </div>
          </div>
        </header>

        {/* Page area */}
        <main className="flex-1 p-4 lg:p-6 grid-bg">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
