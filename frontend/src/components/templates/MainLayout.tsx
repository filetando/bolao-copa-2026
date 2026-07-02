import type { ReactNode } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.tsx'

// Ícones inline (sem dependências externas) — herdam a cor via currentColor
function IconTrophy({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 4h12v4a6 6 0 0 1-12 0V4Z" /><path d="M6 6H4a2 2 0 0 0 2 4M18 6h2a2 2 0 0 1-2 4" /><path d="M12 14v4M9 21h6M10 21v-3h4v3" />
    </svg>
  )
}
function IconBall({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" /><path d="m12 7 4 3-1.5 5h-5L8 10l4-3Z" />
    </svg>
  )
}
function IconTable({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M3 14h18M9 4v16" />
    </svg>
  )
}
function IconStar({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m12 3 2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8L6.6 19.6l1-6L3.3 9.4l6-.9L12 3Z" />
    </svg>
  )
}
function IconShield({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" />
    </svg>
  )
}
function IconBracket({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 5h4v4H4zM4 15h4v4H4zM16 10h4v4h-4z" />
      <path d="M8 7h4v6a2 2 0 0 0 2 2h2M8 17h4v-6" />
    </svg>
  )
}

interface NavItem {
  to: string
  label: string
  icon: (p: { className?: string }) => ReactNode
  exact?: boolean
  adminOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Ranking', icon: IconTrophy, exact: true },
  { to: '/partidas', label: 'Partidas', icon: IconBall },
  { to: '/classificacao', label: 'Grupos', icon: IconTable },
  { to: '/mata-mata', label: 'Mata-mata', icon: IconBracket },
  { to: '/primeiro-acesso', label: 'Estáticos', icon: IconStar },
  { to: '/admin', label: 'Admin', icon: IconShield, adminOnly: true },
]

export function MainLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  function isActive(item: NavItem) {
    return item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to)
  }

  const visibleItems = NAV_ITEMS.filter((i) => !i.adminOnly || user?.role === 'admin')

  return (
    <div className="min-h-screen bg-bg">
      {/* Header — faixa de marca com gradiente esportivo */}
      <header className="sticky top-0 z-30 bg-gradient-to-r from-primary to-primary-bright text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 font-display font-extrabold text-lg tracking-tight rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          >
            <IconBall className="h-6 w-6" />
            <span>Bolão Copa 2026</span>
          </Link>

          {/* Nav horizontal — apenas no desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {visibleItems.map((item) => {
              const active = isActive(item)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={active ? 'page' : undefined}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 ${
                    active ? 'bg-white/20 text-white font-semibold' : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-3 text-sm">
            <span className="text-white/85 hidden sm:block">Olá, {user?.nome}</span>
            <button
              onClick={handleLogout}
              className="rounded-md px-2 py-1 text-white/85 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo — padding inferior extra no mobile p/ não ficar sob a tab bar */}
      <main className="max-w-5xl mx-auto px-4 py-6 pb-24 md:pb-6">
        <Outlet />
      </main>

      {/* Bottom tab bar — apenas no mobile */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-surface border-t border-border shadow-[0_-2px_12px_rgba(28,22,34,0.08)]"
        aria-label="Navegação principal"
      >
        <ul className="flex items-stretch justify-around" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {visibleItems.map((item) => {
            const active = isActive(item)
            const Icon = item.icon
            return (
              <li key={item.to} className="flex-1">
                <Link
                  to={item.to}
                  aria-current={active ? 'page' : undefined}
                  className={`flex flex-col items-center gap-0.5 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent ${
                    active ? 'text-primary' : 'text-muted hover:text-text'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[11px] font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
