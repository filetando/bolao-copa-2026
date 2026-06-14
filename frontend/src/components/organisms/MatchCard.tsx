import { useState } from 'react'
import { api, type ApiError } from '../../lib/api.ts'
import { isMatchLocked, formatTimeBRT } from '../../lib/time.ts'
import { Badge } from '../atoms/Badge.tsx'
import { Button } from '../atoms/Button.tsx'
import { FlagIcon } from '../atoms/FlagIcon.tsx'
import type { Partida, PalpiteData, PalpiteWithUser } from '../../types/index.ts'

interface Props {
  partida: Partida
  meuPalpite: PalpiteData | undefined
  // cutoff para o bloqueio (min dataHoraUtc do grupo simultâneo, se houver)
  lockCutoffUtc: string
}

function TeamLabel({ equipe, placeholder }: { equipe: Partida['equipeCasa']; placeholder: string | null }) {
  if (equipe) {
    return (
      <span className="flex items-center gap-1.5 min-w-0">
        <FlagIcon codigo={equipe.bandeiraCodigo} nome={equipe.nome} />
        <span className="font-medium text-gray-900 truncate">{equipe.sigla ?? equipe.nome}</span>
      </span>
    )
  }
  return <span className="text-gray-400 text-xs italic truncate">{placeholder ?? '?'}</span>
}

function StatusBadge({ status, locked }: { status: string; locked: boolean }) {
  if (status === 'encerrada') return <Badge variant="success">Encerrada</Badge>
  if (status === 'em_andamento') return <Badge variant="live">Ao vivo</Badge>
  if (locked) return <Badge variant="locked">Palpites encerrados</Badge>
  return null
}

export function MatchCard({ partida, meuPalpite: initialPalpite, lockCutoffUtc }: Props) {
  const locked = isMatchLocked(lockCutoffUtc)
  const ended = partida.status === 'encerrada'
  const live = partida.status === 'em_andamento'
  const blocked = locked || ended || live

  const [golsCasa, setGolsCasa] = useState(initialPalpite?.golsCasaPalpite?.toString() ?? '')
  const [golsFora, setGolsFora] = useState(initialPalpite?.golsForaPalpite?.toString() ?? '')
  const [meuPalpite, setMeuPalpite] = useState<PalpiteData | undefined>(initialPalpite)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [showOthers, setShowOthers] = useState(false)
  const [others, setOthers] = useState<PalpiteWithUser[] | null>(null)
  const [othersVisible, setOthersVisible] = useState(false)
  const [loadingOthers, setLoadingOthers] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const casa = parseInt(golsCasa, 10)
    const fora = parseInt(golsFora, 10)
    if (isNaN(casa) || isNaN(fora) || casa < 0 || fora < 0) {
      setSaveError('Preencha os gols (0 ou mais).')
      return
    }
    setSaving(true)
    setSaveError(null)
    try {
      const result = await api.palpites.submit(partida.id, casa, fora)
      setMeuPalpite(result)
    } catch (err) {
      const e = err as ApiError
      setSaveError(e.error?.message ?? 'Erro ao salvar palpite.')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleOthers() {
    if (showOthers) {
      setShowOthers(false)
      return
    }
    setShowOthers(true)
    if (others !== null) return
    setLoadingOthers(true)
    try {
      const result = await api.palpites.forMatch(partida.id)
      setOthers(result.palpites)
      setOthersVisible(result.visibilidadeTotal)
    } catch {
      setOthers([])
    } finally {
      setLoadingOthers(false)
    }
  }

  const hasPalpite = meuPalpite !== undefined

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Cabeçalho */}
      <div className="bg-gray-50 px-4 py-2 flex items-center justify-between text-xs text-gray-500 border-b border-gray-100">
        <span className="font-medium text-gray-700">{partida.faseNome}</span>
        <span>{formatTimeBRT(partida.dataHoraUtc)} BRT</span>
        {partida.estadio && (
          <span className="hidden sm:block truncate max-w-40">{partida.estadio}</span>
        )}
      </div>

      {/* Corpo */}
      <div className="px-4 py-4">
        {blocked ? (
          // Estado bloqueado / encerrado / ao vivo — mostra valores como texto
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <TeamLabel equipe={partida.equipeCasa} placeholder={partida.placeholderCasa} />
            </div>

            <div className="flex items-center gap-2 shrink-0 font-mono font-bold text-xl text-gray-800">
              {ended ? (
                // Placar oficial
                <>
                  <span>{partida.golsCasa ?? '-'}</span>
                  <span className="text-gray-400 text-sm">×</span>
                  <span>{partida.golsFora ?? '-'}</span>
                </>
              ) : (
                // Meu palpite (texto)
                <>
                  <span className={hasPalpite ? 'text-gray-800' : 'text-gray-300'}>
                    {hasPalpite ? meuPalpite!.golsCasaPalpite : '-'}
                  </span>
                  <span className="text-gray-400 text-sm">×</span>
                  <span className={hasPalpite ? 'text-gray-800' : 'text-gray-300'}>
                    {hasPalpite ? meuPalpite!.golsForaPalpite : '-'}
                  </span>
                </>
              )}
            </div>

            <div className="flex-1 min-w-0 flex justify-end">
              <TeamLabel equipe={partida.equipeFora} placeholder={partida.placeholderFora} />
            </div>
          </div>
        ) : (
          // Estado aberto — inputs de palpite
          <form onSubmit={handleSubmit}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <TeamLabel equipe={partida.equipeCasa} placeholder={partida.placeholderCasa} />
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={golsCasa}
                  onChange={(e) => setGolsCasa(e.target.value)}
                  className="w-12 text-center border border-gray-300 rounded-md py-1 text-lg font-bold font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
                  aria-label={`Gols ${partida.equipeCasa?.nome ?? partida.placeholderCasa ?? 'Casa'}`}
                />
                <span className="text-gray-400 font-mono">×</span>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={golsFora}
                  onChange={(e) => setGolsFora(e.target.value)}
                  className="w-12 text-center border border-gray-300 rounded-md py-1 text-lg font-bold font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
                  aria-label={`Gols ${partida.equipeFora?.nome ?? partida.placeholderFora ?? 'Fora'}`}
                />
              </div>

              <div className="flex-1 min-w-0 flex justify-end">
                <TeamLabel equipe={partida.equipeFora} placeholder={partida.placeholderFora} />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              {saveError ? (
                <p className="text-xs text-red-600">{saveError}</p>
              ) : hasPalpite ? (
                <p className="text-xs text-green-700">✓ Palpite salvo</p>
              ) : (
                <span />
              )}
              <Button type="submit" size="sm" loading={saving}>
                {hasPalpite ? 'Atualizar' : 'Salvar palpite'}
              </Button>
            </div>
          </form>
        )}

        {/* Rodapé: pontuação obtida + status */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <StatusBadge status={partida.status} locked={locked} />
            {ended && hasPalpite && meuPalpite!.pontosObtidos !== null && (
              <span className="text-xs font-semibold text-green-700">
                +{meuPalpite!.pontosObtidos} pts
              </span>
            )}
          </div>
          {blocked && (
            <button
              onClick={handleToggleOthers}
              className="text-xs text-blue-600 hover:text-blue-800 underline underline-offset-2"
            >
              {showOthers ? 'Ocultar palpites' : 'Ver palpites'}
            </button>
          )}
        </div>
      </div>

      {/* Palpites de outros */}
      {showOthers && (
        <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
          {loadingOthers ? (
            <p className="text-xs text-gray-400">Carregando…</p>
          ) : !othersVisible ? (
            <p className="text-xs text-gray-500 italic">
              Palpites de outros participantes serão visíveis após o início da partida.
            </p>
          ) : others && others.length === 0 ? (
            <p className="text-xs text-gray-400">Nenhum palpite registrado.</p>
          ) : (
            <ul className="space-y-1">
              {others?.map((p) => (
                <li key={p.id} className="flex items-center justify-between text-xs text-gray-700">
                  <span>{p.nomeUsuario}</span>
                  <span className="font-mono">
                    {p.golsCasaPalpite} × {p.golsForaPalpite}
                    {p.pontosObtidos !== null && (
                      <span className="ml-2 text-green-700 font-semibold">+{p.pontosObtidos}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
