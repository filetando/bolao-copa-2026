import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api.ts'
import { formatTimeBRT } from '../lib/time.ts'
import type { UsuarioBasico, PartidaComPalpiteAdmin, PartidaResumida } from '../types/index.ts'
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

function teamLabel(p: PartidaResumida, side: 'casa' | 'fora'): string {
  if (side === 'casa') return p.equipeCasa?.sigla ?? p.placeholderCasa ?? '?'
  return p.equipeFora?.sigla ?? p.placeholderFora ?? '?'
}

export function AdminPalpitesPage() {
  const [usuarios, setUsuarios] = useState<UsuarioBasico[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [items, setItems] = useState<PartidaComPalpiteAdmin[]>([])
  const [editing, setEditing] = useState<number | null>(null)   // partidaId
  const [inputs, setInputs] = useState<Record<number, GolsInput>>({})
  const [feedback, setFeedback] = useState<Record<number, Feedback>>({})
  const [saving, setSaving] = useState<number | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [loadingList, setLoadingList] = useState(false)
  const [showOnlyMissing, setShowOnlyMissing] = useState(false)

  useEffect(() => {
    api.admin.listUsuarios()
      .then(setUsuarios)
      .catch(() => setFetchError('Erro ao carregar usuários.'))
  }, [])

  useEffect(() => {
    if (!selectedId) {
      setItems([])
      return
    }
    setLoadingList(true)
    setFetchError(null)
    api.admin.getPartidasComPalpite(selectedId)
      .then((data) => {
        setItems(data)
        const init: Record<number, GolsInput> = {}
        for (const item of data) {
          init[item.partida.id] = item.palpite
            ? { casa: String(item.palpite.golsCasaPalpite), fora: String(item.palpite.golsForaPalpite) }
            : { casa: '', fora: '' }
        }
        setInputs(init)
        setEditing(null)
        setFeedback({})
      })
      .catch(() => setFetchError('Erro ao carregar partidas.'))
      .finally(() => setLoadingList(false))
  }, [selectedId])

  async function handleSave(item: PartidaComPalpiteAdmin) {
    const pid = item.partida.id
    const { casa, fora } = inputs[pid] ?? {}
    const gc = parseInt(casa, 10)
    const gf = parseInt(fora, 10)
    if (isNaN(gc) || isNaN(gf) || gc < 0 || gf < 0) {
      setFeedback((f) => ({ ...f, [pid]: { ok: false, msg: 'Gols inválidos.' } }))
      return
    }
    setSaving(pid)
    try {
      let pontosObtidos: number | null = null
      let palpiteId: string

      if (item.palpite) {
        // atualiza palpite existente via id
        const res = await api.admin.updatePalpite(item.palpite.id, gc, gf)
        pontosObtidos = res.pontosObtidos
        palpiteId = res.palpiteId
      } else {
        // cria novo palpite (bypass lock window)
        const res = await api.admin.upsertPalpite(selectedId, pid, gc, gf)
        pontosObtidos = res.pontosObtidos
        palpiteId = res.palpiteId
      }

      setItems((prev) =>
        prev.map((it) =>
          it.partida.id === pid
            ? {
                ...it,
                palpite: {
                  id: palpiteId,
                  golsCasaPalpite: gc,
                  golsForaPalpite: gf,
                  pontosObtidos,
                },
              }
            : it,
        ),
      )
      setFeedback((f) => ({
        ...f,
        [pid]: {
          ok: true,
          msg: pontosObtidos !== null ? `✓ ${pontosObtidos} pts` : '✓ Salvo',
        },
      }))
      setEditing(null)
    } catch (err) {
      const e = err as ApiError
      setFeedback((f) => ({ ...f, [pid]: { ok: false, msg: e.error?.message ?? 'Erro ao salvar.' } }))
    } finally {
      setSaving(null)
    }
  }

  function handleCancel(item: PartidaComPalpiteAdmin) {
    const pid = item.partida.id
    setInputs((i) => ({
      ...i,
      [pid]: item.palpite
        ? { casa: String(item.palpite.golsCasaPalpite), fora: String(item.palpite.golsForaPalpite) }
        : { casa: '', fora: '' },
    }))
    setEditing(null)
    setFeedback((f) => ({ ...f, [pid]: { ok: false, msg: '' } }))
  }

  // Agrupar por rodada
  const grupos: Record<string, PartidaComPalpiteAdmin[]> = {}
  const displayed = showOnlyMissing ? items.filter((it) => !it.palpite) : items
  for (const it of displayed) {
    const rodada = getRodada(it.partida.id)
    if (!grupos[rodada]) grupos[rodada] = []
    grupos[rodada].push(it)
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
  const missingCount = items.filter((it) => !it.palpite).length

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
      <div className="flex items-center gap-3 flex-wrap">
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

        {/* Filtro de faltantes */}
        {items.length > 0 && (
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showOnlyMissing}
              onChange={(e) => setShowOnlyMissing(e.target.checked)}
              className="rounded"
            />
            Mostrar só faltantes
            {missingCount > 0 && (
              <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-0.5 rounded-full">
                {missingCount}
              </span>
            )}
          </label>
        )}
      </div>

      {fetchError && <p className="text-red-600 text-sm">{fetchError}</p>}

      {loadingList && (
        <p className="text-sm text-gray-400">Carregando partidas…</p>
      )}

      {selectedId && !loadingList && items.length === 0 && (
        <p className="text-sm text-gray-400">Nenhuma partida encontrada.</p>
      )}

      {/* Partidas agrupadas por fase */}
      {rodadasPresentes.map((rodada) => (
        <section key={rodada}>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
            {rodada} ({grupos[rodada].length})
          </h2>
          <div className="space-y-2">
            {grupos[rodada].map((item) => {
              const pid = item.partida.id
              const partida = item.partida
              const isEditing = editing === pid
              const hasPalpite = item.palpite !== null
              const casaLabel = teamLabel(partida, 'casa')
              const foraLabel = teamLabel(partida, 'fora')
              const hora = formatTimeBRT(partida.dataHoraUtc)
              const date = new Date(partida.dataHoraUtc).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                timeZone: 'America/Sao_Paulo',
              })
              const isEncerrada = partida.status === 'encerrada'

              return (
                <div
                  key={pid}
                  className={`border rounded-lg px-4 py-3 flex flex-wrap items-center gap-3 ${
                    hasPalpite ? 'bg-white border-gray-200' : 'bg-amber-50 border-amber-200'
                  }`}
                >
                  {/* Nº da partida */}
                  <span className="text-xs text-gray-400 w-6 shrink-0 font-mono">{pid}</span>

                  {/* Data e hora */}
                  <span className="text-xs text-gray-400 w-24 shrink-0">{date} · {hora}</span>

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

                  {/* Palpite / edição */}
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        value={inputs[pid]?.casa ?? ''}
                        onChange={(e) => setInputs((i) => ({ ...i, [pid]: { ...i[pid], casa: e.target.value } }))}
                        className="w-14 border border-gray-300 rounded px-2 py-1 text-sm text-center"
                        autoFocus
                      />
                      <span className="text-gray-400">×</span>
                      <input
                        type="number"
                        min={0}
                        value={inputs[pid]?.fora ?? ''}
                        onChange={(e) => setInputs((i) => ({ ...i, [pid]: { ...i[pid], fora: e.target.value } }))}
                        className="w-14 border border-gray-300 rounded px-2 py-1 text-sm text-center"
                      />
                      <button
                        onClick={() => handleSave(item)}
                        disabled={saving === pid}
                        className="bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white text-xs px-3 py-1 rounded"
                      >
                        {saving === pid ? '…' : 'Salvar'}
                      </button>
                      <button
                        onClick={() => handleCancel(item)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs px-3 py-1 rounded"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : hasPalpite ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-800">
                        {item.palpite!.golsCasaPalpite} × {item.palpite!.golsForaPalpite}
                      </span>
                      {item.palpite!.pontosObtidos !== null && (
                        <span className="text-xs text-blue-700 bg-blue-50 rounded px-2 py-0.5">
                          {item.palpite!.pontosObtidos} pts
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setEditing(pid)
                          setFeedback((f) => ({ ...f, [pid]: { ok: false, msg: '' } }))
                        }}
                        className="text-xs text-amber-700 hover:text-amber-900 border border-amber-300 hover:border-amber-500 px-2 py-0.5 rounded transition-colors"
                      >
                        Alterar
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-amber-600 italic">sem palpite</span>
                      <button
                        onClick={() => {
                          setEditing(pid)
                          setFeedback((f) => ({ ...f, [pid]: { ok: false, msg: '' } }))
                        }}
                        className="text-xs text-white bg-amber-500 hover:bg-amber-600 px-2 py-0.5 rounded transition-colors"
                      >
                        Inserir
                      </button>
                    </div>
                  )}

                  {/* Feedback */}
                  {feedback[pid]?.msg && (
                    <span className={`text-xs ${feedback[pid].ok ? 'text-green-700' : 'text-red-600'}`}>
                      {feedback[pid].msg}
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
