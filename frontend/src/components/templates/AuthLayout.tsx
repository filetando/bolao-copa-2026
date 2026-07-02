import type { ReactNode } from 'react'

// Layout das telas de autenticação: faixa de marca esportiva no topo + cartão centralizado.
export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-sm">
        {/* Marca */}
        <div className="flex flex-col items-center mb-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-bright px-4 py-1.5 text-white font-display font-extrabold tracking-tight shadow-md">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" /><path d="m12 7 4 3-1.5 5h-5L8 10l4-3Z" />
            </svg>
            Bolão Copa 2026
          </span>
        </div>

        <h1 className="text-2xl font-extrabold text-text text-center mb-1">{title}</h1>
        <p className="text-muted text-center text-sm mb-8">{subtitle}</p>

        {children}
      </div>
    </div>
  )
}
