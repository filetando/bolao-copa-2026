import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md'
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  // Base: foco visível, leve elevação no hover (apenas com motion-safe) e "press" no clique
  const base =
    'inline-flex items-center justify-center font-semibold rounded-md transition ' +
    'duration-150 ease-[var(--ease-standard)] active:scale-[0.98] ' +
    'motion-safe:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 ' +
    'focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 ' +
    'disabled:pointer-events-none disabled:translate-y-0'

  const variants = {
    primary: 'bg-primary text-white shadow-sm hover:bg-primary-strong focus-visible:ring-primary',
    accent: 'bg-accent text-white shadow-sm hover:bg-accent-strong focus-visible:ring-accent',
    secondary: 'bg-surface-2 text-text border border-border hover:bg-border focus-visible:ring-muted',
    danger: 'bg-danger text-white shadow-sm hover:brightness-95 focus-visible:ring-danger',
    ghost: 'text-primary hover:bg-surface-2 focus-visible:ring-primary',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        // Spinner inline (substitui o antigo texto "Aguarde…")
        <svg
          className="animate-spin h-4 w-4 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
