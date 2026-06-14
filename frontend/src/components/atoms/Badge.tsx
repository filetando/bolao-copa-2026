import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'success' | 'warning' | 'neutral' | 'locked' | 'live'
}

export function Badge({ children, variant = 'neutral' }: BadgeProps) {
  const variants = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    neutral: 'bg-gray-100 text-gray-600',
    locked: 'bg-gray-200 text-gray-500',
    live: 'bg-red-100 text-red-700',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  )
}
