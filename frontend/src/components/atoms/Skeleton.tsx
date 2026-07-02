// Placeholder de carregamento com brilho suave (shimmer).
// Respeita prefers-reduced-motion (a animação é desativada globalmente nesse caso).
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`bg-surface-2 rounded-md motion-safe:animate-[shimmer_1.4s_ease-in-out_infinite] ${className}`}
      aria-hidden="true"
    />
  )
}
