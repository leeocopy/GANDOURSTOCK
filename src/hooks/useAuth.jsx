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

  const login = async (username, password) => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (data.success) {
        // Store user and token
        const userData = { ...data.user, token: data.token, loginAt: new Date().toISOString() };
        setUser(userData);
        localStorage.setItem('gandoura_auth', JSON.stringify(userData));
        return { success: true };
      }
      return { success: false, error: data.error || 'Identifiants incorrects.' };
    } catch (e) {
      console.error(e);
      return { success: false, error: 'Erreur réseau.' };
    }
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
