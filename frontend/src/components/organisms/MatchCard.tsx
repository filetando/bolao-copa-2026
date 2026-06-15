import { useState } from 'react'
import { api, type ApiError } from '../../lib/api.ts'
import { isMatchLocked, formatTimeBRT } from '../../lib/time.ts'
import { Badge } from '../atoms/Badge.tsx'
import { Button } from '../atoms/Button.tsx'
import { FlagIcon } from '../atoms/FlagIcon.tsx'
import { useAuth } from '../../contexts/AuthContext.tsx'
import type { Partida, PalpiteData, PalpiteWithUser } from '../../types/index.ts'

interface Props {
  partida: Partida
  meuPalpite: PalpiteData | undefined
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

// DOMAIN_RULES.md §7 — replica a cascata de pontuação para exibição da categoria
function getCategoriaPalpite(
  palpite: { golsCasaPalpite: number; golsForaPalpite: number },
  resultado: { golsCasa: number; golsFora: number },
): { label: string; variant: 'success' | 'warning' | 'neutral'; palpiteColor: string } {
  const pc = palpite.golsCasaPalpite
  const pf = palpite.golsForaPalpite
  const rc = resultado.golsCasa
  const rf = resultado.golsFora

  if (pc === rc && pf === rf)
    return { label: 'Placar Exato', variant: 'success', palpiteColor: 'text-green-800' }

  const pEmpate = pc === pf
  const rEmpate = rc === rf
  if (pEmpate && rEmpate)
    return { label: 'Empate', variant: 'success', palpiteColor: 'text-green-600' }
  if (pEmpate || rEmpate)
    return { label: 'Errou', variant: 'neutral', palpiteColor: 'text-red-600' }

  const mesmoVencedor = (pc > pf && rc > rf) || (pc < pf && rc < rf)
  if (!mesmoVencedor)
    return { label: 'Errou', variant: 'neutral', palpiteColor: 'text-red-600' }

  const rVencGols = rc > rf ? rc : rf
  const pVencGols = rc > rf ? pc : pf
  if (pVencGols === rVencGols)
    return { label: 'Vencedor + Gols', variant: 'success', palpiteColor: 'text-green-600' }
  if (pc - pf === rc - rf)
    return { label: 'Vencedor + Saldo', variant: 'success', palpiteColor: 'text-green-600' }
  return { label: 'Só Vencedor', variant: 'warning', palpiteColor: 'text-green-600' }
}

function StatusBadge({
  status,
  locked,
  palpite,
  resultado,
}: {
  status: string
  locked: boolean
  palpite?: PalpiteData
  resultado?: { golsCasa: number | null; golsFora: number | null }
}) {
  if (status === 'encerrada') {
    if (palpite && resultado?.golsCasa !== null && resultado?.golsFora !== null) {
      const cat = getCategoriaPalpite(palpite, {
        golsCasa: resultado.golsCasa!,
        golsFora: resultado.golsFora!,
      })
      return <Badge variant={cat.variant}>{cat.label}</Badge>
    }
    return <Badge variant="neutral">Encerrada</Badge>
  }
  if (status === 'em_andamento') return <Badge variant="live">Ao vivo</Badge>
  if (locked) return <Badge variant="locked">Palpites encerrados</Badge>
  return null
}

export function MatchCard({ partida, meuPalpite: initialPalpite, lockCutoffUtc }: Props) {
  const { user } = useAuth()
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
  // Filtra o palpite do próprio usuário da lista de "outros"
  const othersFiltered = others?.filter((p) => p.usuarioId !== user?.id) ?? []

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden max-w-2xl w-full mx-auto">
      {/* Cabeçalho — grid de 3 colunas para centralizar o horário */}
      <div className="bg-gray-50 px-4 py-2 grid grid-cols-3 items-center text-xs text-gray-500 border-b border-gray-100">
        <span className="font-medium text-gray-700">{partida.faseNome}</span>
        <span className="text-center">{formatTimeBRT(partida.dataHoraUtc)} BRT</span>
        {partida.estadio ? (
          <span className="hidden sm:block text-right truncate">{partida.estadio}</span>
        ) : (
          <span />
        )}
      </div>

      {/* Corpo */}
      <div className="px-4 py-4">
        {blocked ? (
          // Estado bloqueado / encerrado / ao vivo
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <TeamLabel equipe={partida.equipeCasa} placeholder={partida.placeholderCasa} />
            </div>

            <div className="flex flex-col items-center shrink-0">
              {/* Placar oficial */}
              <div className="flex items-center gap-2 font-mono font-bold text-xl text-gray-800">
                {ended ? (
                  <>
                    <span>{partida.golsCasa ?? '-'}</span>
                    <span className="text-gray-400 text-sm">×</span>
                    <span>{partida.golsFora ?? '-'}</span>
                  </>
                ) : (
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
              {/* Meu palpite abaixo do placar oficial */}
              {ended && hasPalpite && partida.golsCasa !== null && partida.golsFora !== null && (() => {
                const cat = getCategoriaPalpite(meuPalpite!, { golsCasa: partida.golsCasa!, golsFora: partida.golsFora! })
                return (
                  <span className={`text-sm font-mono font-semibold mt-0.5 ${cat.palpiteColor}`}>
                    {meuPalpite!.golsCasaPalpite} × {meuPalpite!.golsForaPalpite}
                  </span>
                )
              })()}
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

        {/* Rodapé: categoria do acerto / status + pontos */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <StatusBadge
              status={partida.status}
              locked={locked}
              palpite={meuPalpite}
              resultado={{ golsCasa: partida.golsCasa, golsFora: partida.golsFora }}
            />
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

      {/* Palpites de outros (sem o do usuário atual) */}
      {showOthers && (
        <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
          {loadingOthers ? (
            <p className="text-xs text-gray-400">Carregando…</p>
          ) : !othersVisible ? (
            <p className="text-xs text-gray-500 italic">
              Palpites de outros participantes serão visíveis após o início da partida.
            </p>
          ) : othersFiltered.length === 0 ? (
            <p className="text-xs text-gray-400">Nenhum palpite de outros participantes.</p>
          ) : (
            <ul className="space-y-1">
              {othersFiltered.map((p) => (
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
