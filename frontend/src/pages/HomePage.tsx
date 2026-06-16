import { useEffect, useState } from 'react'
import { api } from '../lib/api.ts'
import { LeaderboardTable } from '../components/organisms/LeaderboardTable.tsx'
import { PointsHistoryChart } from '../components/organisms/PointsHistoryChart.tsx'
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
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Ranking Geral</h2>

      {loading && <p className="text-gray-400 text-sm">Carregando…</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {!loading && !error && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <LeaderboardTable rows={rows} />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Disputa de pontos</h3>
            {historico && <PointsHistoryChart data={historico} />}
          </div>
        </div>
      )}
    </div>
  )
}
