import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { AuthUser } from '@/lib/auth'
import { getStoredUser } from '@/lib/auth'

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [user, setUser] = useState<AuthUser | null>(getStoredUser())

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setUser(getStoredUser())
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  useEffect(() => {
    if (token) setUser(getStoredUser())
  }, [token])

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
