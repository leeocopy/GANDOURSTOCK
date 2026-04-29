import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

// Static credentials (admin only — matches skill.md "Role: Admin/Owner only")
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'gandoura2026',
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Restore session from localStorage to persist across tabs/sessions
    const session = localStorage.getItem('gandoura_auth')
    if (session) {
      try {
        setUser(JSON.parse(session))
      } catch {
        localStorage.removeItem('gandoura_auth')
      }
    }
    setLoading(false)
  }, [])

  const login = (username, password) => {
    if (
      username.trim().toLowerCase() === ADMIN_CREDENTIALS.username &&
      password === ADMIN_CREDENTIALS.password
    ) {
      const userData = { username: 'admin', role: 'owner', loginAt: new Date().toISOString() }
      setUser(userData)
      localStorage.setItem('gandoura_auth', JSON.stringify(userData))
      return { success: true }
    }
    return { success: false, error: 'Identifiants incorrects. Réessayez.' }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('gandoura_auth')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
