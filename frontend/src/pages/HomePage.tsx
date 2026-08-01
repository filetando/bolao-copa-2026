import { useEffect, useState } from 'react'
import { api } from '../lib/api.ts'
import { LeaderboardTable } from '../components/organisms/LeaderboardTable.tsx'
import { PointsHistoryChart } from '../components/organisms/PointsHistoryChart.tsx'
import { LeadershipStrip } from '../components/organisms/dashboard/LeadershipStrip.tsx'
import { AccuracyProfileChart } from '../components/organisms/dashboard/AccuracyProfileChart.tsx'
import { PointsByPhaseChart } from '../components/organisms/dashboard/PointsByPhaseChart.tsx'
import { PhaseEfficiencyChart } from '../components/organisms/dashboard/PhaseEfficiencyChart.tsx'
import { MultiplierCounterfactualChart } from '../components/organisms/dashboard/MultiplierCounterfactualChart.tsx'
import { AccuracyDonutChart } from '../components/organisms/dashboard/AccuracyDonutChart.tsx'
import { RecordCards } from '../components/organisms/dashboard/RecordCards.tsx'
import { Skeleton } from '../components/atoms/Skeleton.tsx'
import type { LeaderboardRow, LeaderboardHistoryResponse, DashboardEstatisticas } from '../types/index.ts'

export function HomePage() {
  const [rows, setRows] = useState<LeaderboardRow[]>([])
  const [historico, setHistorico] = useState<LeaderboardHistoryResponse | null>(null)
  const [estatisticas, setEstatisticas] = useState<DashboardEstatisticas | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([api.leaderboard.get(), api.leaderboard.historico(), api.dashboard.estatisticas()])
      .then(([leaderboardRows, historicoData, estatisticasData]) => {
        setRows(leaderboardRows)
        setHistorico(historicoData)
        setEstatisticas(estatisticasData)
      })
      .catch(() => setError('Não foi possível carregar o ranking.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-extrabold text-text mb-4">Ranking Geral</h2>

      {error && <p className="text-danger text-sm">{error}</p>}

      {loading ? (
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
            {/* Resultado */}
            <div className="bg-surface rounded-[12px] border border-border shadow-sm p-4 motion-safe:animate-[rise_0.32s_var(--ease-standard)]">
              <LeaderboardTable rows={rows} />
            </div>

            {/* Disputa */}
            <div className="bg-surface rounded-[12px] border border-border shadow-sm p-4 motion-safe:animate-[rise_0.32s_var(--ease-standard)]">
              <h3 className="text-sm font-semibold text-text mb-2">Disputa de pontos</h3>
              {historico && <PointsHistoryChart data={historico} />}
              {historico && <LeadershipStrip data={historico} />}
            </div>

            {estatisticas && (
              <>
                {/* Quem é cada um — peça de destaque */}
                <div className="bg-surface rounded-[12px] border border-border shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-text mb-1">Perfil de acerto</h3>
                  <p className="text-xs text-muted mb-3">
                    De onde veio cada palpite — mostra o estilo de cada um, não só o placar.
                  </p>
                  <AccuracyProfileChart data={estatisticas.perfilAcerto} />
                </div>

                {/* O plot twist */}
                <div className="bg-surface rounded-[12px] border border-border shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-text mb-1">Pontos por fase</h3>
                  <p className="text-xs text-muted mb-3">Onde cada um fez a diferença, já com o multiplicador aplicado.</p>
                  <PointsByPhaseChart data={estatisticas.pontosPorFase} />
                </div>

                <div className="bg-surface rounded-[12px] border border-border shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-text mb-1">Aproveitamento por fase</h3>
                  <p className="text-xs text-muted mb-3">
                    % do máximo possível em cada fase — corrige a distorção dos multiplicadores.
                  </p>
                  <PhaseEfficiencyChart data={estatisticas.aproveitamentoPorFase} />
                </div>

                <div className="bg-surface rounded-[12px] border border-border shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-text mb-1">Ranking real vs. tudo 1x</h3>
                  <p className="text-xs text-muted mb-3">
                    Foi a final de 4x que decidiu o campeão, ou já estava ganho antes do mata-mata?
                  </p>
                  <MultiplierCounterfactualChart data={estatisticas.contrafactual} />
                </div>

                <div className="bg-surface rounded-[12px] border border-border shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-text mb-1">Taxa de acerto</h3>
                  <p className="text-xs text-muted mb-3">
                    % de acerto só entre os palpites que cada um realmente fez — separa "acerta pouco" de
                    "esqueceu de apostar".
                  </p>
                  <AccuracyDonutChart data={estatisticas.taxaAcerto} />
                </div>

                {/* Os momentos */}
                <div className="bg-surface rounded-[12px] border border-border shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-text mb-3">Recordes do bolão</h3>
                  <RecordCards data={estatisticas.recordes} />
                </div>
              </>
            )}
          </div>
        )
      )}
    </div>
  )
}
