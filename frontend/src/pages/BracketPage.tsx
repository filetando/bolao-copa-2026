import { useEffect, useState } from 'react'
import { api } from '../lib/api.ts'
import { Skeleton } from '../components/atoms/Skeleton.tsx'
import { BracketTree } from '../components/organisms/BracketTree.tsx'
import type { Partida } from '../types/index.ts'

export function BracketPage() {
  const [partidas, setPartidas] = useState<Partida[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  function load() {
    return api.mataMata
      .list()
      .then(setPartidas)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // Refetch ao focar a aba — mantém a árvore atualizada sem exigir reload manual (YAGNI: sem WebSocket).
    const onFocus = () => load()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-extrabold text-text">Mata-mata</h1>

      {loading ? (
        <div className="flex gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-56 shrink-0" />
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-danger">Erro ao carregar o chaveamento.</p>
      ) : partidas.length === 0 ? (
        <p className="text-sm text-muted">Chaveamento ainda não disponível.</p>
      ) : (
        <BracketTree partidas={partidas} />
      )}
    </div>
  )
}
