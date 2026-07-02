import { useEffect, useState } from 'react'
import { api } from '../lib/api.ts'
import { FlagIcon } from '../components/atoms/FlagIcon.tsx'
import { Skeleton } from '../components/atoms/Skeleton.tsx'
import type { ClassificacaoRow } from '../types/index.ts'

const GRUPOS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

function saldoLabel(n: number): string {
  if (n > 0) return `+${n}`
  return String(n)
}

function GrupoTable({ grupoId }: { grupoId: string }) {
  const [rows, setRows] = useState<ClassificacaoRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    api.grupos
      .classificacao(grupoId)
      .then(setRows)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [grupoId])

  return (
    <section>
      <h2 className="text-lg font-bold text-text mb-2">Grupo {grupoId}</h2>
      <div className="bg-surface rounded-lg border border-border shadow-sm overflow-x-auto">
        {loading ? (
          <div className="p-3 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-full" />
            ))}
          </div>
        ) : error ? (
          <p className="px-4 py-4 text-xs text-danger">Erro ao carregar.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted text-xs uppercase tracking-wide">
                <th className="px-2 py-1.5 text-left w-6">#</th>
                <th className="px-2 py-1.5 text-left">Equipe</th>
                <th className="px-2 py-1.5 text-center font-bold text-text">Pts</th>
                <th className="px-2 py-1.5 text-center">J</th>
                <th className="px-2 py-1.5 text-center">V</th>
                <th className="px-2 py-1.5 text-center">E</th>
                <th className="px-2 py-1.5 text-center">D</th>
                <th className="px-2 py-1.5 text-center">GP</th>
                <th className="px-2 py-1.5 text-center">GC</th>
                <th className="px-2 py-1.5 text-center">SG</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => {
                // 1º e 2º lugar classificam para o mata-mata → destaque
                const classificado = idx < 2
                return (
                  <tr
                    key={row.equipe.id}
                    className={`border-b border-border last:border-0 ${
                      classificado ? 'bg-success-soft' : ''
                    }`}
                  >
                    <td className="px-2 py-1.5 text-muted text-xs font-mono">{row.posicao}</td>
                    <td className="px-2 py-1.5">
                      <div className="flex items-center gap-2">
                        <FlagIcon codigo={row.equipe.bandeiraCodigo} nome={row.equipe.nome} />
                        <span className="font-semibold text-text">{row.equipe.sigla ?? row.equipe.nome}</span>
                      </div>
                    </td>
                    <td className="px-2 py-1.5 text-center font-bold text-text font-mono tabular-nums">{row.pontos}</td>
                    <td className="px-2 py-1.5 text-center text-muted tabular-nums">{row.jogos}</td>
                    <td className="px-2 py-1.5 text-center text-muted tabular-nums">{row.vitorias}</td>
                    <td className="px-2 py-1.5 text-center text-muted tabular-nums">{row.empates}</td>
                    <td className="px-2 py-1.5 text-center text-muted tabular-nums">{row.derrotas}</td>
                    <td className="px-2 py-1.5 text-center text-muted tabular-nums">{row.golsMarcados}</td>
                    <td className="px-2 py-1.5 text-center text-muted tabular-nums">{row.golsSofridos}</td>
                    <td className="px-2 py-1.5 text-center text-muted tabular-nums">{saldoLabel(row.saldoGols)}</td>
                  </tr>
                )
              })}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-4 text-center text-muted text-xs">
                    Nenhuma partida encerrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}

export function ClassificacaoPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-extrabold text-text">Classificação — Fase de Grupos</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        {GRUPOS.map((g) => (
          <GrupoTable key={g} grupoId={g} />
        ))}
      </div>
      <p className="text-xs text-muted flex items-center gap-1.5">
        <span className="inline-block h-3 w-3 rounded-sm bg-success-soft border border-success/30" />
        Fundo verde = classificados para o mata-mata (1º e 2º lugar).
      </p>
    </div>
  )
}
