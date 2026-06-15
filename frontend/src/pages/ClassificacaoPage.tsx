import { useEffect, useState } from 'react'
import { api } from '../lib/api.ts'
import { FlagIcon } from '../components/atoms/FlagIcon.tsx'
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
      <h2 className="text-lg font-bold text-gray-900 mb-2">
        Grupo {grupoId}
      </h2>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
        {loading ? (
          <p className="px-4 py-4 text-xs text-gray-400">Carregando…</p>
        ) : error ? (
          <p className="px-4 py-4 text-xs text-red-500">Erro ao carregar.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wide">
                <th className="px-3 py-2 text-left w-6">#</th>
                <th className="px-3 py-2 text-left">Equipe</th>
                <th className="px-3 py-2 text-center font-bold text-gray-700">Pts</th>
                <th className="px-3 py-2 text-center">J</th>
                <th className="px-3 py-2 text-center">V</th>
                <th className="px-3 py-2 text-center">E</th>
                <th className="px-3 py-2 text-center">D</th>
                <th className="px-3 py-2 text-center">GP</th>
                <th className="px-3 py-2 text-center">GC</th>
                <th className="px-3 py-2 text-center">SG</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr
                  key={row.equipe.id}
                  className={`border-b border-gray-100 last:border-0 ${idx < 2 ? 'bg-green-50' : ''}`}
                >
                  <td className="px-3 py-2 text-gray-400 text-xs">{row.posicao}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <FlagIcon codigo={row.equipe.bandeiraCodigo} nome={row.equipe.nome} />
                      <span className="font-medium text-gray-800">{row.equipe.sigla ?? row.equipe.nome}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center font-bold text-gray-900">{row.pontos}</td>
                  <td className="px-3 py-2 text-center text-gray-600">{row.jogos}</td>
                  <td className="px-3 py-2 text-center text-gray-600">{row.vitorias}</td>
                  <td className="px-3 py-2 text-center text-gray-600">{row.empates}</td>
                  <td className="px-3 py-2 text-center text-gray-600">{row.derrotas}</td>
                  <td className="px-3 py-2 text-center text-gray-600">{row.golsMarcados}</td>
                  <td className="px-3 py-2 text-center text-gray-600">{row.golsSofridos}</td>
                  <td className="px-3 py-2 text-center text-gray-600">{saldoLabel(row.saldoGols)}</td>
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-4 text-center text-gray-400 text-xs">
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
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Classificação — Fase de Grupos</h1>
      {GRUPOS.map((g) => (
        <GrupoTable key={g} grupoId={g} />
      ))}
      <p className="text-xs text-gray-400">
        Fundo verde = classificados para o mata-mata (1º e 2º lugar).
      </p>
    </div>
  )
}
