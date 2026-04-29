import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { Lock, User, Eye, EyeOff, Zap } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    await new Promise((r) => setTimeout(r, 700)) // simulate auth latency

    const result = login(username, password)
    if (!result.success) {
      setError(result.error)
      setLoading(false)
      setShake(true)
      setTimeout(() => setShake(false), 600)
    }
  }

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center relative overflow-hidden scanline">
      {/* Ambient glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-neon/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-cyan-neon/40"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 20}%`,
          }}
          animate={{ y: [-10, 10, -10], opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-sm px-4"
      >
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass-card mb-4 mx-auto"
            animate={{ boxShadow: ['0 0 10px rgba(0,242,255,0.1)', '0 0 30px rgba(0,242,255,0.3)', '0 0 10px rgba(0,242,255,0.1)'] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Zap size={28} className="text-cyan-neon" />
          </motion.div>
          <h1 className="text-2xl font-bold text-glow text-gradient-cyan mb-1">
            Gandoura Stock
          </h1>
          <p className="text-xs text-white/30 font-mono tracking-widest uppercase">
            Management System v1.0
          </p>
        </div>

        {/* Form Card */}
        <motion.form
          onSubmit={handleSubmit}
          animate={shake ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="glass-card p-8 shadow-cyan-glow"
        >
          <p className="text-xs font-mono text-white/30 tracking-widest uppercase mb-6 text-center">
            — Accès Restreint —
          </p>

          {/* Username */}
          <div className="mb-5">
            <label className="label-glass" htmlFor="username">Identifiant</label>
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-neon/50" />
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-glass pl-9"
                placeholder="admin"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="label-glass" htmlFor="password">Mot de passe</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-neon/50" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-glass pl-9 pr-10"
                placeholder="••••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-cyan-neon transition-colors"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-red-400 text-xs font-medium mb-4 text-center bg-red-500/10 border border-red-500/20 rounded-lg py-2 px-3"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full relative overflow-hidden bg-cyan-neon/10 border border-cyan-neon/30 text-cyan-neon font-semibold py-3 rounded-xl transition-all hover:bg-cyan-neon/20 hover:border-cyan-neon/60 hover:shadow-cyan-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <motion.div
                  className="w-4 h-4 border-2 border-cyan-neon/30 border-t-cyan-neon rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                />
                <span className="text-sm tracking-wider">Authentification...</span>
              </>
            ) : (
              <>
                <Lock size={15} />
                <span className="text-sm tracking-wider uppercase">Connexion</span>
              </>
            )}
          </motion.button>

          <hr className="neon-divider" />
          <p className="text-xs text-white/20 text-center font-mono">
            user: <span className="text-cyan-neon/50">admin</span> · pass: <span className="text-cyan-neon/50">gandoura2026</span>
          </p>
        </motion.form>
      </motion.div>
    </div>
  )
}
