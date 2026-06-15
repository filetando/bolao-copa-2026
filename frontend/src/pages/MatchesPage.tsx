import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api.ts'
import { MatchCard } from '../components/organisms/MatchCard.tsx'
import { formatDateLabelBRT, getDateKeyBRT } from '../lib/time.ts'
import type { Partida, PalpiteData } from '../types/index.ts'

export function MatchesPage() {
  const [partidas, setPartidas] = useState<Partida[]>([])
  const [meusPalpites, setMeusPalpites] = useState<PalpiteData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([api.partidas.list(), api.palpites.me()])
      .then(([p, mp]) => {
        setPartidas(p)
        setMeusPalpites(mp)
      })
      .catch(() => setError('Não foi possível carregar as partidas.'))
      .finally(() => setLoading(false))
  }, [])

  // Para cada grupoSimultaneoId, calcula o menor dataHoraUtc (cutoff real de bloqueio)
  const lockCutoffs = useMemo(() => {
    const map = new Map<number, string>()
    for (const p of partidas) {
      if (p.grupoSimultaneoId !== null) {
        const current = map.get(p.grupoSimultaneoId)
        if (!current || p.dataHoraUtc < current) {
          map.set(p.grupoSimultaneoId, p.dataHoraUtc)
        }
      }
    }
    return map
  }, [partidas])

  // Map de partidaId → meuPalpite
  const palpiteMap = useMemo(() => {
    return new Map(meusPalpites.map((p) => [p.partidaId, p]))
  }, [meusPalpites])

  // Agrupa por data BRT
  const byDate = useMemo(() => {
    const groups = new Map<string, { label: string; partidas: Partida[] }>()
    for (const p of partidas) {
      const key = getDateKeyBRT(p.dataHoraUtc)
      if (!groups.has(key)) {
        groups.set(key, { label: formatDateLabelBRT(p.dataHoraUtc), partidas: [] })
      }
      groups.get(key)!.partidas.push(p)
    }
    return groups
  }, [partidas])

  if (loading) return <p className="text-gray-400 text-sm">Carregando partidas…</p>
  if (error) return <p className="text-red-600 text-sm">{error}</p>

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <h2 className="text-xl font-bold text-gray-900">Partidas</h2>
      {Array.from(byDate.entries()).map(([key, group]) => (
        <section key={key}>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 capitalize">
            {group.label}
          </h3>
          <div className="space-y-3">
            {group.partidas.map((partida) => {
              const cutoff =
                partida.grupoSimultaneoId !== null
                  ? (lockCutoffs.get(partida.grupoSimultaneoId) ?? partida.dataHoraUtc)
                  : partida.dataHoraUtc
              return (
                <MatchCard
                  key={partida.id}
                  partida={partida}
                  meuPalpite={palpiteMap.get(partida.id)}
                  lockCutoffUtc={cutoff}
                />
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
