import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.tsx'

export function MainLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  function navClass(path: string) {
    const active = location.pathname === path
    return `text-sm transition-colors ${active ? 'text-white font-semibold' : 'text-green-200 hover:text-white'}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-800 text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <nav className="flex items-center gap-6">
            <Link to="/" className="font-bold text-base tracking-tight">
              Bolão Copa 2026
            </Link>
            <Link to="/" className={navClass('/')}>
              Ranking
            </Link>
            <Link to="/partidas" className={navClass('/partidas')}>
              Partidas
            </Link>
            <Link to="/primeiro-acesso" className={navClass('/primeiro-acesso')}>
              Palpites Estáticos
            </Link>
          </nav>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-green-200 hidden sm:block">Olá, {user?.nome}</span>
            <button onClick={handleLogout} className="text-green-200 hover:text-white transition-colors">
              Sair
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
