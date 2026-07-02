import { useEffect, useState } from 'react'
import { api } from '../lib/api.ts'
import { LeaderboardTable } from '../components/organisms/LeaderboardTable.tsx'
import { PointsHistoryChart } from '../components/organisms/PointsHistoryChart.tsx'
import { Skeleton } from '../components/atoms/Skeleton.tsx'
import type { LeaderboardRow, LeaderboardHistoryResponse } from '../types/index.ts'

export function HomePage() {
  const [rows, setRows] = useState<LeaderboardRow[]>([])
  const [historico, setHistorico] = useState<LeaderboardHistoryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([api.leaderboard.get(), api.leaderboard.historico()])
      .then(([leaderboardRows, historicoData]) => {
        setRows(leaderboardRows)
        setHistorico(historicoData)
      })
      .catch(() => setError('Não foi possível carregar o ranking.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-extrabold text-text mb-4">Ranking Geral</h2>

      {error && <p className="text-danger text-sm">{error}</p>}

      {loading ? (
        // Skeletons no lugar de "Carregando…"
        <div className="space-y-6">
          <div className="bg-surface rounded-lg border border-border shadow-sm p-4 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
          <div className="bg-surface rounded-lg border border-border shadow-sm p-4">
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      ) : (
        !error && (
          <div className="space-y-6">
            <div className="bg-surface rounded-lg border border-border shadow-sm p-4 motion-safe:animate-[rise_0.32s_var(--ease-standard)]">
              <LeaderboardTable rows={rows} />
            </div>
            <div className="bg-surface rounded-lg border border-border shadow-sm p-4 motion-safe:animate-[rise_0.32s_var(--ease-standard)]">
              <h3 className="text-sm font-semibold text-text mb-2">Disputa de pontos</h3>
              {historico && <PointsHistoryChart data={historico} />}
            </div>
          </div>
        )
      )}
    </div>
  )
}
