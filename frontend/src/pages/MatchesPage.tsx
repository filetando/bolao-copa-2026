import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api.ts'
import { MatchCard } from '../components/organisms/MatchCard.tsx'
import { Skeleton } from '../components/atoms/Skeleton.tsx'
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

  // Jogos de hoje e amanhã (BRT) aparecem primeiro; o restante segue em ordem cronológica.
  // Cada grupo carrega um marcador relativo ('hoje'/'amanha') para destaque visual.
  const orderedGroups = useMemo(() => {
    const todayKey = getDateKeyBRT(new Date().toISOString())
    const tomorrowKey = getDateKeyBRT(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())
    const relativo = (key: string): 'hoje' | 'amanha' | null =>
      key === todayKey ? 'hoje' : key === tomorrowKey ? 'amanha' : null

    const entries = Array.from(byDate.entries()).map(([key, group]) => ({
      key,
      group,
      relativo: relativo(key),
    }))
    const priority = entries.filter((e) => e.relativo !== null)
    const rest = entries.filter((e) => e.relativo === null)
    return [...priority, ...rest]
  }, [byDate])

  if (error) return <p className="text-danger text-sm">{error}</p>

  if (loading) {
    return (
      <div className="max-w-lg mx-auto space-y-8">
        <h2 className="text-2xl font-extrabold text-text">Partidas</h2>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <h2 className="text-2xl font-extrabold text-text">Partidas</h2>
      {orderedGroups.map(({ key, group, relativo }) => (
        <section key={key}>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wide capitalize">
              {group.label}
            </h3>
            {relativo && (
              <span className="inline-flex items-center rounded-full bg-primary/12 text-primary px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide">
                {relativo === 'hoje' ? 'Hoje' : 'Amanhã'}
              </span>
            )}
          </div>
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
