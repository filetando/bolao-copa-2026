import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'success' | 'warning' | 'neutral' | 'locked' | 'live'
}

export function Badge({ children, variant = 'neutral' }: BadgeProps) {
  // Cada variante usa fundo "soft" + texto da cor semântica (contraste AA).
  // O rótulo textual sempre acompanha a cor — nunca comunicamos status só por cor (daltonismo).
  const variants = {
    success: 'bg-success-soft text-success',
    warning: 'bg-warning-soft text-warning',
    neutral: 'bg-neutral-soft text-muted',
    locked: 'bg-locked-soft text-locked',
    live: 'bg-live-soft text-live',
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${variants[variant]}`}
    >
      {variant === 'live' && (
        // Ponto pulsante "ao vivo"
        <span className="h-1.5 w-1.5 rounded-full bg-live motion-safe:animate-[livePulse_1.6s_ease-in-out_infinite]" aria-hidden="true" />
      )}
      {children}
    </span>
  )
}
