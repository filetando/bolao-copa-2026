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
        <span className="font-semibold text-text truncate">{equipe.sigla ?? equipe.nome}</span>
      </span>
    )
  }
  return <span className="text-muted text-xs italic truncate">{placeholder ?? '?'}</span>
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
    return { label: 'Placar Exato', variant: 'success', palpiteColor: 'text-success' }

  const pEmpate = pc === pf
  const rEmpate = rc === rf
  if (pEmpate && rEmpate)
    return { label: 'Empate', variant: 'success', palpiteColor: 'text-success' }
  if (pEmpate || rEmpate)
    return { label: 'Errou', variant: 'neutral', palpiteColor: 'text-danger' }

  const mesmoVencedor = (pc > pf && rc > rf) || (pc < pf && rc < rf)
  if (!mesmoVencedor)
    return { label: 'Errou', variant: 'neutral', palpiteColor: 'text-danger' }

  const rVencGols = rc > rf ? rc : rf
  const pVencGols = rc > rf ? pc : pf
  if (pVencGols === rVencGols)
    return { label: 'Vencedor + Gols', variant: 'success', palpiteColor: 'text-success' }
  if (pc - pf === rc - rf)
    return { label: 'Vencedor + Saldo', variant: 'success', palpiteColor: 'text-success' }
  return { label: 'Só Vencedor', variant: 'warning', palpiteColor: 'text-warning' }
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

  // Cor da borda lateral conforme o estado da partida (leitura rápida do status)
  const stateBorder = ended
    ? 'border-l-neutral'
    : live
      ? 'border-l-live'
      : locked
        ? 'border-l-locked'
        : 'border-l-primary' // aberto: convida ao palpite

  return (
    <div
      className={`bg-surface rounded-lg border border-border border-l-4 ${stateBorder} shadow-sm overflow-hidden transition-shadow hover:shadow-md`}
    >
      {/* Cabeçalho — grid de 3 colunas para centralizar o horário */}
      <div className="bg-surface-2 px-4 py-2 grid grid-cols-3 items-center text-xs text-muted border-b border-border">
        <span className="font-semibold text-text truncate">{partida.faseNome}</span>
        <span className="text-center font-mono">{formatTimeBRT(partida.dataHoraUtc)} BRT</span>
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
          <div className="flex flex-col gap-1">
            {/* Linha única: países + placar sempre alinhados */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <TeamLabel equipe={partida.equipeCasa} placeholder={partida.placeholderCasa} />
              </div>
              <div className="flex items-center gap-2 font-mono font-bold text-2xl text-text tabular-nums shrink-0">
                {ended ? (
                  <>
                    <span>{partida.golsCasa ?? '-'}</span>
                    <span className="text-muted text-sm">×</span>
                    <span>{partida.golsFora ?? '-'}</span>
                  </>
                ) : (
                  <>
                    <span className={hasPalpite ? 'text-text' : 'text-locked'}>
                      {hasPalpite ? meuPalpite!.golsCasaPalpite : '-'}
                    </span>
                    <span className="text-muted text-sm">×</span>
                    <span className={hasPalpite ? 'text-text' : 'text-locked'}>
                      {hasPalpite ? meuPalpite!.golsForaPalpite : '-'}
                    </span>
                  </>
                )}
              </div>
              <div className="flex-1 min-w-0 flex justify-end">
                <TeamLabel equipe={partida.equipeFora} placeholder={partida.placeholderFora} />
              </div>
            </div>
            {/* Meu palpite em linha própria — não desloca o placar acima */}
            {ended && hasPalpite && partida.golsCasa !== null && partida.golsFora !== null && (() => {
              const cat = getCategoriaPalpite(meuPalpite!, { golsCasa: partida.golsCasa!, golsFora: partida.golsFora! })
              return (
                <div className="flex justify-center">
                  <span className={`text-sm font-mono font-semibold ${cat.palpiteColor}`}>
                    {meuPalpite!.golsCasaPalpite} × {meuPalpite!.golsForaPalpite}
                  </span>
                </div>
              )
            })()}
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
                  inputMode="numeric"
                  className="w-12 h-11 text-center bg-surface-2 border border-border rounded-md text-lg font-bold font-mono tabular-nums text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  aria-label={`Gols ${partida.equipeCasa?.nome ?? partida.placeholderCasa ?? 'Casa'}`}
                />
                <span className="text-muted font-mono">×</span>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={golsFora}
                  onChange={(e) => setGolsFora(e.target.value)}
                  inputMode="numeric"
                  className="w-12 h-11 text-center bg-surface-2 border border-border rounded-md text-lg font-bold font-mono tabular-nums text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  aria-label={`Gols ${partida.equipeFora?.nome ?? partida.placeholderFora ?? 'Fora'}`}
                />
              </div>

              <div className="flex-1 min-w-0 flex justify-end">
                <TeamLabel equipe={partida.equipeFora} placeholder={partida.placeholderFora} />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              {saveError ? (
                <p className="text-xs text-danger">{saveError}</p>
              ) : hasPalpite ? (
                <p
                  key={`${meuPalpite!.golsCasaPalpite}-${meuPalpite!.golsForaPalpite}`}
                  className="text-xs font-semibold text-success motion-safe:animate-[pop_0.32s_var(--ease-emphasized)]"
                >
                  ✓ Palpite salvo
                </p>
              ) : (
                <span />
              )}
              <Button type="submit" variant="accent" size="sm" loading={saving}>
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
              <span className="inline-flex items-center rounded-full bg-success-soft px-2 py-0.5 text-xs font-bold text-success font-mono tabular-nums motion-safe:animate-[pop_0.32s_var(--ease-emphasized)]">
                +{meuPalpite!.pontosObtidos} pts
              </span>
            )}
          </div>
          {blocked && (
            <button
              onClick={handleToggleOthers}
              className="text-xs font-medium text-accent hover:text-accent-strong rounded px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {showOthers ? 'Ocultar palpites' : 'Ver palpites'}
            </button>
          )}
        </div>
      </div>

      {/* Palpites de outros (sem o do usuário atual) */}
      {showOthers && (
        <div className="border-t border-border bg-surface-2 px-4 py-3 motion-safe:animate-[rise_0.32s_var(--ease-standard)]">
          {loadingOthers ? (
            <p className="text-xs text-muted">Carregando…</p>
          ) : !othersVisible ? (
            <p className="text-xs text-muted italic">
              Palpites de outros participantes serão visíveis após o início da partida.
            </p>
          ) : othersFiltered.length === 0 ? (
            <p className="text-xs text-muted">Nenhum palpite de outros participantes.</p>
          ) : (
            <ul className="space-y-1">
              {othersFiltered.map((p) => (
                <li key={p.id} className="flex items-center justify-end gap-3 text-xs text-text">
                  <span>{p.nomeUsuario}</span>
                  <span className="font-mono tabular-nums">
                    {p.golsCasaPalpite} × {p.golsForaPalpite}
                    {p.pontosObtidos !== null && (
                      <span className="ml-2 text-success font-semibold">+{p.pontosObtidos}</span>
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
