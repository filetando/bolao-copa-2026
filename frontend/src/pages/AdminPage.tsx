import { useEffect, useState } from 'react'
import { api } from '../lib/api.ts'
import { formatDateLabelBRT, formatTimeBRT } from '../lib/time.ts'
import type { Partida } from '../types/index.ts'
import type { ApiError } from '../lib/api.ts'

interface MatchInput {
  golsCasa: string
  golsFora: string
}

interface Feedback {
  ok: boolean
  msg: string
}

function teamLabel(p: Partida, side: 'casa' | 'fora'): string {
  if (side === 'casa') return p.equipeCasa?.sigla ?? p.placeholderCasa ?? '?'
  return p.equipeFora?.sigla ?? p.placeholderFora ?? '?'
}

export function AdminPage() {
  const [partidas, setPartidas] = useState<Partida[]>([])
  const [inputs, setInputs] = useState<Record<number, MatchInput>>({})
  const [feedback, setFeedback] = useState<Record<number, Feedback>>({})
  const [loading, setLoading] = useState<Record<number, boolean>>({})
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    api.partidas.list()
      .then((data) => {
        setPartidas(data)
        const init: Record<number, MatchInput> = {}
        for (const p of data) init[p.id] = { golsCasa: '', golsFora: '' }
        setInputs(init)
      })
      .catch(() => setFetchError('Erro ao carregar partidas.'))
  }, [])

  async function handleRegister(id: number) {
    const { golsCasa, golsFora } = inputs[id] ?? {}
    const gc = parseInt(golsCasa, 10)
    const gf = parseInt(golsFora, 10)
    if (isNaN(gc) || isNaN(gf) || gc < 0 || gf < 0) {
      setFeedback((f) => ({ ...f, [id]: { ok: false, msg: 'Gols inválidos.' } }))
      return
    }
    setLoading((l) => ({ ...l, [id]: true }))
    setFeedback((f) => ({ ...f, [id]: { ok: false, msg: '' } }))
    try {
      const res = await api.admin.registerResult(id, gc, gf)
      setFeedback((f) => ({ ...f, [id]: { ok: true, msg: `✓ ${res.palpitesCalculados} palpites calculados` } }))
      setPartidas((ps) =>
        ps.map((p) => (p.id === id ? { ...p, golsCasa: gc, golsFora: gf, status: 'encerrada' } : p)),
      )
    } catch (err) {
      const e = err as ApiError
      setFeedback((f) => ({ ...f, [id]: { ok: false, msg: e.error?.message ?? 'Erro ao registrar.' } }))
    } finally {
      setLoading((l) => ({ ...l, [id]: false }))
    }
  }

  const abertas = partidas.filter((p) => p.status !== 'encerrada')
  const encerradas = partidas.filter((p) => p.status === 'encerrada')

  if (fetchError) return <p className="text-red-600 text-sm">{fetchError}</p>

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold text-gray-900">Painel Admin — Registrar Resultados</h1>

      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Aguardando resultado ({abertas.length})
        </h2>
        {abertas.length === 0 && <p className="text-sm text-gray-400">Todas as partidas já foram encerradas.</p>}
        <div className="space-y-2">
          {abertas.map((p) => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex flex-wrap items-center gap-3">
              <span className="text-xs text-gray-400 w-36 shrink-0">
                {formatDateLabelBRT(p.dataHoraUtc).slice(0, 10)} · {formatTimeBRT(p.dataHoraUtc)}
              </span>
              <span className="font-medium text-gray-800 min-w-[7rem] text-center">
                {teamLabel(p, 'casa')} × {teamLabel(p, 'fora')}
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={inputs[p.id]?.golsCasa ?? ''}
                  onChange={(e) => setInputs((i) => ({ ...i, [p.id]: { ...i[p.id], golsCasa: e.target.value } }))}
                  className="w-14 border border-gray-300 rounded px-2 py-1 text-sm text-center"
                />
                <span className="text-gray-400">×</span>
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={inputs[p.id]?.golsFora ?? ''}
                  onChange={(e) => setInputs((i) => ({ ...i, [p.id]: { ...i[p.id], golsFora: e.target.value } }))}
                  className="w-14 border border-gray-300 rounded px-2 py-1 text-sm text-center"
                />
                <button
                  onClick={() => handleRegister(p.id)}
                  disabled={loading[p.id]}
                  className="bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white text-sm px-3 py-1 rounded transition-colors"
                >
                  {loading[p.id] ? '…' : 'Registrar'}
                </button>
              </div>
              {feedback[p.id]?.msg && (
                <span className={`text-xs ${feedback[p.id].ok ? 'text-green-700' : 'text-red-600'}`}>
                  {feedback[p.id].msg}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Encerradas — corrigir resultado ({encerradas.length})
        </h2>
        {encerradas.length === 0 && <p className="text-sm text-gray-400">Nenhuma partida encerrada ainda.</p>}
        <div className="space-y-2">
          {encerradas.map((p) => (
            <div key={p.id} className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex flex-wrap items-center gap-3">
              <span className="text-xs text-gray-400 w-36 shrink-0">
                {formatDateLabelBRT(p.dataHoraUtc).slice(0, 10)} · {formatTimeBRT(p.dataHoraUtc)}
              </span>
              <span className="text-gray-500 min-w-[7rem] text-center text-sm">
                {teamLabel(p, 'casa')} <span className="font-semibold text-gray-800">{p.golsCasa} × {p.golsFora}</span> {teamLabel(p, 'fora')}
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  placeholder={String(p.golsCasa ?? 0)}
                  value={inputs[p.id]?.golsCasa ?? ''}
                  onChange={(e) => setInputs((i) => ({ ...i, [p.id]: { ...i[p.id], golsCasa: e.target.value } }))}
                  className="w-14 border border-gray-300 rounded px-2 py-1 text-sm text-center"
                />
                <span className="text-gray-400">×</span>
                <input
                  type="number"
                  min={0}
                  placeholder={String(p.golsFora ?? 0)}
                  value={inputs[p.id]?.golsFora ?? ''}
                  onChange={(e) => setInputs((i) => ({ ...i, [p.id]: { ...i[p.id], golsFora: e.target.value } }))}
                  className="w-14 border border-gray-300 rounded px-2 py-1 text-sm text-center"
                />
                <button
                  onClick={() => handleRegister(p.id)}
                  disabled={loading[p.id]}
                  className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-sm px-3 py-1 rounded transition-colors"
                >
                  {loading[p.id] ? '…' : 'Corrigir'}
                </button>
              </div>
              {feedback[p.id]?.msg && (
                <span className={`text-xs ${feedback[p.id].ok ? 'text-green-700' : 'text-red-600'}`}>
                  {feedback[p.id].msg}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
