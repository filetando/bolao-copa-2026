import { useEffect, useState } from 'react'
import { api } from '../lib/api.ts'
import type { ClassificacaoRow } from '../types/index.ts'

const GRUPOS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

function saldoLabel(n: number): string {
  if (n > 0) return `+${n}`
  return String(n)
}

export function ClassificacaoPage() {
  const [grupoSel, setGrupoSel] = useState('A')
  const [rows, setRows] = useState<ClassificacaoRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    api.grupos
      .classificacao(grupoSel)
      .then(setRows)
      .catch(() => setError('Não foi possível carregar a classificação.'))
      .finally(() => setLoading(false))
  }, [grupoSel])

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Classificação — Fase de Grupos</h1>

      {/* Seletor de grupo */}
      <div className="flex flex-wrap gap-1">
        {GRUPOS.map((g) => (
          <button
            key={g}
            onClick={() => setGrupoSel(g)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              grupoSel === g
                ? 'bg-green-700 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Grupo {g}
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-400 text-sm">Carregando…</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {!loading && !error && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wide">
                <th className="px-4 py-3 text-left w-8">#</th>
                <th className="px-4 py-3 text-left">Equipe</th>
                <th className="px-4 py-3 text-center">J</th>
                <th className="px-4 py-3 text-center">V</th>
                <th className="px-4 py-3 text-center">E</th>
                <th className="px-4 py-3 text-center">D</th>
                <th className="px-4 py-3 text-center">GP</th>
                <th className="px-4 py-3 text-center">GC</th>
                <th className="px-4 py-3 text-center">SG</th>
                <th className="px-4 py-3 text-center font-bold text-gray-700">Pts</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr
                  key={row.equipe.id}
                  className={`border-b border-gray-100 last:border-0 ${idx < 2 ? 'bg-green-50' : ''}`}
                >
                  <td className="px-4 py-3 text-gray-500">{row.posicao}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {row.equipe.sigla ?? row.equipe.nome}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">{row.jogos}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{row.vitorias}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{row.empates}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{row.derrotas}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{row.golsMarcados}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{row.golsSofridos}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{saldoLabel(row.saldoGols)}</td>
                  <td className="px-4 py-3 text-center font-bold text-gray-900">{row.pontos}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-6 text-center text-gray-400 text-sm">
                    Nenhuma partida encerrada no Grupo {grupoSel}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-gray-400">
        Fundo verde = classificados para o mata-mata (1º e 2º lugar).
      </p>
    </div>
  )
}
