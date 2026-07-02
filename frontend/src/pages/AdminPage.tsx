import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api.ts'
import { formatDateLabelBRT, formatTimeBRT } from '../lib/time.ts'
import type { Partida, ConfrontoGerado } from '../types/index.ts'
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
  const [bracketLoading, setBracketLoading] = useState(false)
  const [bracketError, setBracketError] = useState<string | null>(null)
  const [bracketResult, setBracketResult] = useState<ConfrontoGerado[] | null>(null)

  function loadPartidas() {
    return api.partidas.list().then((data) => {
      setPartidas(data)
      setInputs((prev) => {
        const next = { ...prev }
        for (const p of data) if (!next[p.id]) next[p.id] = { golsCasa: '', golsFora: '' }
        return next
      })
      return data
    })
  }

  useEffect(() => {
    loadPartidas().catch(() => setFetchError('Erro ao carregar partidas.'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const jogosDeGrupo = partidas.filter((p) => p.faseNome === 'Fase de Grupos')
  const grupoCompleto = jogosDeGrupo.length > 0 && jogosDeGrupo.every((p) => p.status === 'encerrada')
  const jogosMataMataResolvidos = partidas.some((p) => p.id >= 73 && p.id <= 88 && p.equipeCasa !== null)

  async function handleGenerateBracket() {
    setBracketLoading(true)
    setBracketError(null)
    try {
      const res = await api.admin.generateBracket()
      setBracketResult(res.confrontos)
      await loadPartidas() // recarrega para exibir nomes reais nos jogos 73-88
    } catch (err) {
      const e = err as ApiError
      setBracketError(e.error?.message ?? 'Erro ao gerar o chaveamento.')
    } finally {
      setBracketLoading(false)
    }
  }

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

  if (fetchError) return <p className="text-danger text-sm">{fetchError}</p>

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-extrabold text-text">Painel Admin — Registrar Resultados</h1>
        <Link
          to="/admin/palpites"
          className="text-sm text-primary hover:text-white hover:bg-primary border border-primary/40 rounded-md px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Alterar Palpites dos Usuários →
        </Link>
      </div>

      <section>
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
          Aguardando resultado ({abertas.length})
        </h2>
        {abertas.length === 0 && <p className="text-sm text-muted">Todas as partidas já foram encerradas.</p>}
        <div className="space-y-2">
          {abertas.map((p) => (
            <div key={p.id} className="bg-surface border border-border rounded-lg px-4 py-3 flex flex-wrap items-center gap-3">
              <span className="text-xs text-muted w-36 shrink-0">
                {formatDateLabelBRT(p.dataHoraUtc).slice(0, 10)} · {formatTimeBRT(p.dataHoraUtc)}
              </span>
              <span className="font-semibold text-text min-w-[7rem] text-center">
                {teamLabel(p, 'casa')} × {teamLabel(p, 'fora')}
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={inputs[p.id]?.golsCasa ?? ''}
                  onChange={(e) => setInputs((i) => ({ ...i, [p.id]: { ...i[p.id], golsCasa: e.target.value } }))}
                  className="w-14 bg-surface-2 border border-border rounded px-2 py-1 text-sm text-center text-text font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-muted">×</span>
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={inputs[p.id]?.golsFora ?? ''}
                  onChange={(e) => setInputs((i) => ({ ...i, [p.id]: { ...i[p.id], golsFora: e.target.value } }))}
                  className="w-14 bg-surface-2 border border-border rounded px-2 py-1 text-sm text-center text-text font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={() => handleRegister(p.id)}
                  disabled={loading[p.id]}
                  className="bg-primary hover:bg-primary-strong disabled:opacity-50 text-white text-sm px-3 py-1 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  {loading[p.id] ? '…' : 'Registrar'}
                </button>
              </div>
              {feedback[p.id]?.msg && (
                <span className={`text-xs ${feedback[p.id].ok ? 'text-success' : 'text-danger'}`}>
                  {feedback[p.id].msg}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Mata-mata</h2>
        <div className="bg-surface border border-border rounded-lg px-4 py-4 space-y-3">
          {jogosMataMataResolvidos ? (
            <p className="text-sm text-success">✓ Chaveamento já gerado — jogos 73–88 com times reais.</p>
          ) : (
            <>
              <p className="text-sm text-muted">
                {grupoCompleto
                  ? 'Fase de grupos completa. Gera os 16 confrontos dos jogos 73–88 (ADR-003).'
                  : 'Aguardando o encerramento de todos os jogos da fase de grupos (1–72).'}
              </p>
              <button
                onClick={() => {
                  if (window.confirm('Gerar o chaveamento do mata-mata agora? Esta ação atualiza os jogos 73–88.')) {
                    handleGenerateBracket()
                  }
                }}
                disabled={!grupoCompleto || bracketLoading}
                className="bg-accent hover:brightness-95 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                {bracketLoading ? 'Gerando…' : 'Gerar chaveamento do mata-mata'}
              </button>
            </>
          )}
          {bracketError && <p className="text-sm text-danger">{bracketError}</p>}
          {bracketResult && (
            <ul className="text-sm text-text space-y-1 pt-2 border-t border-border">
              {bracketResult.map((c) => {
                const partida = partidas.find((p) => p.id === c.partidaId)
                return (
                  <li key={c.partidaId} className="flex justify-between gap-2">
                    <span className="text-muted">Jogo {c.partidaId}</span>
                    <span className="font-semibold">
                      {partida?.equipeCasa?.nome ?? c.equipeCasaId} × {partida?.equipeFora?.nome ?? c.equipeForaId}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
          Encerradas — corrigir resultado ({encerradas.length})
        </h2>
        {encerradas.length === 0 && <p className="text-sm text-muted">Nenhuma partida encerrada ainda.</p>}
        <div className="space-y-2">
          {encerradas.map((p) => (
            <div key={p.id} className="bg-surface-2 border border-border rounded-lg px-4 py-3 flex flex-wrap items-center gap-3">
              <span className="text-xs text-muted w-36 shrink-0">
                {formatDateLabelBRT(p.dataHoraUtc).slice(0, 10)} · {formatTimeBRT(p.dataHoraUtc)}
              </span>
              <span className="text-muted min-w-[7rem] text-center text-sm">
                {teamLabel(p, 'casa')} <span className="font-semibold text-text font-mono tabular-nums">{p.golsCasa} × {p.golsFora}</span> {teamLabel(p, 'fora')}
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  placeholder={String(p.golsCasa ?? 0)}
                  value={inputs[p.id]?.golsCasa ?? ''}
                  onChange={(e) => setInputs((i) => ({ ...i, [p.id]: { ...i[p.id], golsCasa: e.target.value } }))}
                  className="w-14 bg-surface-2 border border-border rounded px-2 py-1 text-sm text-center text-text font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-muted">×</span>
                <input
                  type="number"
                  min={0}
                  placeholder={String(p.golsFora ?? 0)}
                  value={inputs[p.id]?.golsFora ?? ''}
                  onChange={(e) => setInputs((i) => ({ ...i, [p.id]: { ...i[p.id], golsFora: e.target.value } }))}
                  className="w-14 bg-surface-2 border border-border rounded px-2 py-1 text-sm text-center text-text font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={() => handleRegister(p.id)}
                  disabled={loading[p.id]}
                  className="bg-warning hover:brightness-95 disabled:opacity-50 text-white text-sm px-3 py-1 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning focus-visible:ring-offset-2"
                >
                  {loading[p.id] ? '…' : 'Corrigir'}
                </button>
              </div>
              {feedback[p.id]?.msg && (
                <span className={`text-xs ${feedback[p.id].ok ? 'text-success' : 'text-danger'}`}>
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
