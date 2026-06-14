import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext.tsx'
import { MainLayout } from './components/templates/MainLayout.tsx'
import { LoginPage } from './pages/LoginPage.tsx'
import { RegisterPage } from './pages/RegisterPage.tsx'
import { HomePage } from './pages/HomePage.tsx'
import { MatchesPage } from './pages/MatchesPage.tsx'
import { FirstAccessPage } from './pages/FirstAccessPage.tsx'

function ProtectedRoute() {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">Carregando…</div>
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}

function PublicRoute() {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">Carregando…</div>
  if (user) return <Navigate to="/" replace />
  return <Outlet />
}

export const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: '/', element: <HomePage /> },
          { path: '/partidas', element: <MatchesPage /> },
          { path: '/primeiro-acesso', element: <FirstAccessPage /> },
        ],
      },
    ],
  },
  {
    element: <PublicRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
