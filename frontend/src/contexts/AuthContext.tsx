import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api } from '../lib/api.ts'
import type { UserPayload } from '../types/index.ts'

interface AuthContextValue {
  user: UserPayload | null
  loading: boolean
  login: (username: string, senha: string) => Promise<void>
  register: (nome: string, username: string, senha: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserPayload | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.auth
      .me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  async function login(username: string, senha: string) {
    const u = await api.auth.login(username, senha)
    setUser(u)
  }

  async function register(nome: string, username: string, senha: string) {
    await api.auth.register(nome, username, senha)
    await login(username, senha)
  }

  async function logout() {
    await api.auth.logout().catch(() => {})
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
