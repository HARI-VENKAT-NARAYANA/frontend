import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import api, { getApiError } from '../services/api'
import type { Role, User } from '../types'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string, remember: boolean) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me')
      setUser(response.data.data)
    } catch {
      localStorage.removeItem('neuzen-token')
      sessionStorage.removeItem('neuzen-token')
      setUser(null)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('neuzen-token') || sessionStorage.getItem('neuzen-token')
    if (!token) {
      setIsLoading(false)
      return
    }
    refreshUser().finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    const handleExpired = () => {
      setUser(null)
      setError('Your session has expired. Please sign in again.')
    }
    window.addEventListener('neuzen:session-expired', handleExpired)
    return () => window.removeEventListener('neuzen:session-expired', handleExpired)
  }, [])

  const login = async (email: string, password: string, remember: boolean) => {
    setError(null)
    try {
      const response = await api.post('/auth/login', { email, password })
      const { token, user: nextUser } = response.data.data as { token: string; user: User }
      const storage = remember ? localStorage : sessionStorage
      storage.setItem('neuzen-token', token)
      setUser(nextUser)
    } catch (requestError) {
      const message = getApiError(requestError, 'Unable to sign in right now.')
      setError(message)
      throw new Error(message)
    }
  }

  const logout = () => {
    localStorage.removeItem('neuzen-token')
    sessionStorage.removeItem('neuzen-token')
    setUser(null)
  }

  const value = useMemo(() => ({ user, isLoading, error, login, logout, refreshUser }), [user, isLoading, error])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}

export function roleHome(role: Role) {
  return role === 'ADMIN' ? '/admin/dashboard' : role === 'HR' ? '/hr/dashboard' : '/employee/dashboard'
}
