import { FlagIcon } from '../atoms/FlagIcon.tsx'
import { Badge } from '../atoms/Badge.tsx'
import type { Partida } from '../../types/index.ts'

interface BracketMatchNodeProps {
  partida: Partida
}

function ladoLabel(equipe: Partida['equipeCasa'], placeholder: string | null): string {
  return equipe?.sigla ?? equipe?.nome ?? placeholder ?? '?'
}

export function BracketMatchNode({ partida }: BracketMatchNodeProps) {
  const encerrada = partida.status === 'encerrada'
  const empatouNoTempoNormal = encerrada && partida.golsCasa !== null && partida.golsFora !== null && partida.golsCasa === partida.golsFora
  // DOMAIN_RULES.md §6 — em empate de mata-mata, o placar registrado continua sendo o do
  // tempo normal; quem avança é decidido por vencedorPenaltisEquipeId.
  const foiNosPenaltis = empatouNoTempoNormal && partida.vencedorPenaltisEquipeId !== null

  const casaVenceu =
    encerrada &&
    partida.golsCasa !== null &&
    partida.golsFora !== null &&
    (empatouNoTempoNormal
      ? partida.vencedorPenaltisEquipeId === partida.equipeCasa?.id
      : partida.golsCasa > partida.golsFora)
  const foraVenceu =
    encerrada &&
    partida.golsCasa !== null &&
    partida.golsFora !== null &&
    (empatouNoTempoNormal
      ? partida.vencedorPenaltisEquipeId === partida.equipeFora?.id
      : partida.golsFora > partida.golsCasa)

  return (
    <div className="bg-surface border border-border rounded-lg px-3 py-2 w-56 shrink-0 space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <FlagIcon codigo={partida.equipeCasa?.bandeiraCodigo ?? null} nome={ladoLabel(partida.equipeCasa, partida.placeholderCasa)} />
          <span className={`truncate text-sm ${casaVenceu ? 'font-bold text-accent' : 'text-text'}`}>
            {ladoLabel(partida.equipeCasa, partida.placeholderCasa)}
          </span>
          {casaVenceu && <span aria-hidden="true" className="text-accent">▸</span>}
        </div>
        {encerrada && <span className="font-mono tabular-nums text-sm text-text shrink-0">{partida.golsCasa}</span>}
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <FlagIcon codigo={partida.equipeFora?.bandeiraCodigo ?? null} nome={ladoLabel(partida.equipeFora, partida.placeholderFora)} />
          <span className={`truncate text-sm ${foraVenceu ? 'font-bold text-accent' : 'text-text'}`}>
            {ladoLabel(partida.equipeFora, partida.placeholderFora)}
          </span>
          {foraVenceu && <span aria-hidden="true" className="text-accent">▸</span>}
        </div>
        {encerrada && <span className="font-mono tabular-nums text-sm text-text shrink-0">{partida.golsFora}</span>}
      </div>
      {!encerrada && (
        <Badge variant={partida.equipeCasa && partida.equipeFora ? 'neutral' : 'locked'}>
          {partida.equipeCasa && partida.equipeFora ? 'Aguardando' : 'Pendente'}
        </Badge>
      )}
      {foiNosPenaltis && <Badge variant="warning">Decidido nos pênaltis</Badge>}
    </div>
  )
}
