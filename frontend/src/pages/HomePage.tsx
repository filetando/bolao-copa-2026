import { useEffect, useState } from 'react'
import { api } from '../lib/api.ts'
import { LeaderboardTable } from '../components/organisms/LeaderboardTable.tsx'
import type { LeaderboardRow } from '../types/index.ts'

export function HomePage() {
  const [rows, setRows] = useState<LeaderboardRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.leaderboard
      .get()
      .then(setRows)
      .catch(() => setError('Não foi possível carregar o ranking.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Ranking Geral</h2>

      {loading && <p className="text-gray-400 text-sm">Carregando…</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {!loading && !error && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <LeaderboardTable rows={rows} />
        </div>
      )}
    </div>
  )
}
