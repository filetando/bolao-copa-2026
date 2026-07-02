import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.tsx'
import { Button } from '../components/atoms/Button.tsx'
import { AuthLayout } from '../components/templates/AuthLayout.tsx'
import type { ApiError } from '../lib/api.ts'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [nome, setNome] = useState('')
  const [username, setUsername] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await register(nome.trim(), username.trim(), senha)
      navigate('/', { replace: true })
    } catch (err) {
      const e = err as ApiError
      setError(e.error?.message ?? 'Erro ao cadastrar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Criar conta" subtitle="Entre na disputa do bolão">
      <form onSubmit={handleSubmit} className="bg-surface rounded-lg border border-border shadow-sm p-6 space-y-4">
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-text mb-1">
            Nome completo
          </label>
          <input
            id="nome"
            type="text"
            autoComplete="name"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full bg-surface-2 border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            required
          />
        </div>

        <div>
          <label htmlFor="username" className="block text-sm font-medium text-text mb-1">
            Usuário
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-surface-2 border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            required
          />
        </div>

        <div>
          <label htmlFor="senha" className="block text-sm font-medium text-text mb-1">
            Senha
          </label>
          <input
            id="senha"
            type="password"
            autoComplete="new-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full bg-surface-2 border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            minLength={8}
            required
          />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" loading={loading} className="w-full justify-center">
          Criar conta
        </Button>

        <p className="text-center text-sm text-muted">
          Já tem conta?{' '}
          <Link to="/login" className="text-primary hover:text-primary-strong font-semibold rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            Entrar
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
