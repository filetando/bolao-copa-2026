import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api.ts'
import { formatTimeBRT } from '../lib/time.ts'
import type { UsuarioBasico, PalpiteComPartida } from '../types/index.ts'
import type { ApiError } from '../lib/api.ts'

interface GolsInput {
  casa: string
  fora: string
}

interface Feedback {
  ok: boolean
  msg: string
}

function getRodada(partidaId: number): string {
  if (partidaId <= 2) return 'Abertura'
  if (partidaId <= 24) return 'R1 · Fase de Grupos'
  if (partidaId <= 48) return 'R2 · Fase de Grupos'
  if (partidaId <= 72) return 'R3 · Fase de Grupos'
  if (partidaId <= 88) return '16 avos de Final'
  if (partidaId <= 96) return 'Oitavas de Final'
  if (partidaId <= 100) return 'Quartas de Final'
  if (partidaId <= 102) return 'Semifinal'
  if (partidaId === 103) return 'Terceiro Lugar'
  return 'Final'
}

function teamLabel(p: PalpiteComPartida['partida'], side: 'casa' | 'fora'): string {
  if (side === 'casa') return p.equipeCasa?.sigla ?? p.placeholderCasa ?? '?'
  return p.equipeFora?.sigla ?? p.placeholderFora ?? '?'
}

export function AdminPalpitesPage() {
  const [usuarios, setUsuarios] = useState<UsuarioBasico[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [palpites, setPalpites] = useState<PalpiteComPartida[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [inputs, setInputs] = useState<Record<string, GolsInput>>({})
  const [feedback, setFeedback] = useState<Record<string, Feedback>>({})
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    api.admin.listUsuarios()
      .then(setUsuarios)
      .catch(() => setFetchError('Erro ao carregar usuários.'))
  }, [])

  useEffect(() => {
    if (!selectedId) {
      setPalpites([])
      return
    }
    setLoading(true)
    setFetchError(null)
    api.admin.getPalpitesUsuario(selectedId)
      .then((data) => {
        setPalpites(data)
        const init: Record<string, GolsInput> = {}
        for (const p of data) init[p.id] = { casa: String(p.golsCasaPalpite), fora: String(p.golsForaPalpite) }
        setInputs(init)
        setEditing(null)
        setFeedback({})
      })
      .catch(() => setFetchError('Erro ao carregar palpites.'))
      .finally(() => setLoading(false))
  }, [selectedId])

  async function handleSave(palpite: PalpiteComPartida) {
    const { casa, fora } = inputs[palpite.id] ?? {}
    const gc = parseInt(casa, 10)
    const gf = parseInt(fora, 10)
    if (isNaN(gc) || isNaN(gf) || gc < 0 || gf < 0) {
      setFeedback((f) => ({ ...f, [palpite.id]: { ok: false, msg: 'Gols inválidos.' } }))
      return
    }
    setLoading(true)
    try {
      const res = await api.admin.updatePalpite(palpite.id, gc, gf)
      setPalpites((ps) =>
        ps.map((p) =>
          p.id === palpite.id
            ? { ...p, golsCasaPalpite: gc, golsForaPalpite: gf, pontosObtidos: res.pontosObtidos }
            : p,
        ),
      )
      setFeedback((f) => ({
        ...f,
        [palpite.id]: {
          ok: true,
          msg: res.pontosObtidos !== null ? `✓ ${res.pontosObtidos} pts` : '✓ Salvo',
        },
      }))
      setEditing(null)
    } catch (err) {
      const e = err as ApiError
      setFeedback((f) => ({ ...f, [palpite.id]: { ok: false, msg: e.error?.message ?? 'Erro ao salvar.' } }))
    } finally {
      setLoading(false)
    }
  }

  function handleCancel(palpite: PalpiteComPartida) {
    setInputs((i) => ({ ...i, [palpite.id]: { casa: String(palpite.golsCasaPalpite), fora: String(palpite.golsForaPalpite) } }))
    setEditing(null)
    setFeedback((f) => ({ ...f, [palpite.id]: { ok: false, msg: '' } }))
  }

  // Agrupar por rodada
  const grupos: Record<string, PalpiteComPartida[]> = {}
  for (const p of palpites) {
    const rodada = getRodada(p.partidaId)
    if (!grupos[rodada]) grupos[rodada] = []
    grupos[rodada].push(p)
  }

  const rodadaOrdem = [
    'Abertura',
    'R1 · Fase de Grupos',
    'R2 · Fase de Grupos',
    'R3 · Fase de Grupos',
    '16 avos de Final',
    'Oitavas de Final',
    'Quartas de Final',
    'Semifinal',
    'Terceiro Lugar',
    'Final',
  ]

  const rodadasPresentes = rodadaOrdem.filter((r) => grupos[r]?.length)

  const selectedUser = usuarios.find((u) => u.id === selectedId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Painel Admin — Palpites dos Usuários</h1>
        <Link
          to="/admin"
          className="text-sm text-gray-500 hover:text-gray-700 border border-gray-300 hover:border-gray-400 rounded-md px-3 py-1.5 transition-colors"
        >
          ← Registrar Resultados
        </Link>
      </div>

      {/* Seletor de usuário */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Usuário:</label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-600 min-w-[220px]"
        >
          <option value="">— Selecione um usuário —</option>
          {usuarios.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nome} ({u.username})
            </option>
          ))}
        </select>
      </div>

      {fetchError && <p className="text-red-600 text-sm">{fetchError}</p>}

      {loading && !palpites.length && (
        <p className="text-sm text-gray-400">Carregando palpites…</p>
      )}

      {selectedUser && palpites.length === 0 && !loading && (
        <p className="text-sm text-gray-400">Nenhum palpite registrado para este usuário.</p>
      )}

      {/* Palpites agrupados por fase */}
      {rodadasPresentes.map((rodada) => (
        <section key={rodada}>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
            {rodada} ({grupos[rodada].length})
          </h2>
          <div className="space-y-2">
            {grupos[rodada].map((p) => {
              const isEditing = editing === p.id
              const partida = p.partida
              const casaLabel = teamLabel(partida, 'casa')
              const foraLabel = teamLabel(partida, 'fora')
              const hora = formatTimeBRT(partida.dataHoraUtc)
              const date = new Date(partida.dataHoraUtc).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' })
              const isEncerrada = partida.status === 'encerrada'

              return (
                <div
                  key={p.id}
                  className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex flex-wrap items-center gap-3"
                >
                  {/* Data e hora */}
                  <span className="text-xs text-gray-400 w-28 shrink-0">{date} · {hora}</span>

                  {/* Times */}
                  <span className="text-sm text-gray-700 font-medium min-w-[6rem] text-center">
                    {casaLabel} × {foraLabel}
                  </span>

                  {/* Resultado real (se encerrada) */}
                  {isEncerrada && partida.golsCasa !== null && (
                    <span className="text-xs text-gray-400 bg-gray-100 rounded px-2 py-0.5">
                      Real: {partida.golsCasa}×{partida.golsFora}
                    </span>
                  )}

                  {/* Palpite atual ou inputs de edição */}
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        value={inputs[p.id]?.casa ?? ''}
                        onChange={(e) => setInputs((i) => ({ ...i, [p.id]: { ...i[p.id], casa: e.target.value } }))}
                        className="w-14 border border-gray-300 rounded px-2 py-1 text-sm text-center"
                      />
                      <span className="text-gray-400">×</span>
                      <input
                        type="number"
                        min={0}
                        value={inputs[p.id]?.fora ?? ''}
                        onChange={(e) => setInputs((i) => ({ ...i, [p.id]: { ...i[p.id], fora: e.target.value } }))}
                        className="w-14 border border-gray-300 rounded px-2 py-1 text-sm text-center"
                      />
                      <button
                        onClick={() => handleSave(p)}
                        disabled={loading}
                        className="bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white text-xs px-3 py-1 rounded"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => handleCancel(p)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs px-3 py-1 rounded"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-800">
                        {p.golsCasaPalpite} × {p.golsForaPalpite}
                      </span>
                      {p.pontosObtidos !== null && (
                        <span className="text-xs text-blue-700 bg-blue-50 rounded px-2 py-0.5">
                          {p.pontosObtidos} pts
                        </span>
                      )}
                      <button
                        onClick={() => { setEditing(p.id); setFeedback((f) => ({ ...f, [p.id]: { ok: false, msg: '' } })) }}
                        className="text-xs text-amber-700 hover:text-amber-900 border border-amber-300 hover:border-amber-500 px-2 py-0.5 rounded transition-colors"
                      >
                        Alterar
                      </button>
                    </div>
                  )}

                  {/* Feedback */}
                  {feedback[p.id]?.msg && (
                    <span className={`text-xs ${feedback[p.id].ok ? 'text-green-700' : 'text-red-600'}`}>
                      {feedback[p.id].msg}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
