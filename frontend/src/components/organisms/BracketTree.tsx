import { BracketMatchNode } from '../molecules/BracketMatchNode.tsx'
import type { Partida } from '../../types/index.ts'

interface BracketTreeProps {
  partidas: Partida[]
}

// Ordem das rodadas do mata-mata (jogos 73-104) — DOMAIN_RULES.md §6. O jogo 103 (3º lugar)
// é renderizado à parte, pois não alimenta nenhuma rodada seguinte.
const ORDEM_RODADAS = ['16-Avos de Final', 'Oitavas de Final', 'Quartas de Final', 'Semifinais', 'Final']
const RODADA_TERCEIRO_LUGAR = 'Terceiro Lugar'

export function BracketTree({ partidas }: BracketTreeProps) {
  const porRodada = new Map<string, Partida[]>()
  for (const p of partidas) {
    if (p.faseNome === RODADA_TERCEIRO_LUGAR) continue
    if (!porRodada.has(p.faseNome)) porRodada.set(p.faseNome, [])
    porRodada.get(p.faseNome)!.push(p)
  }

  const terceiroLugar = partidas.find((p) => p.faseNome === RODADA_TERCEIRO_LUGAR)

  return (
    <div className="space-y-6">
      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 lg:overflow-visible lg:snap-none">
        {ORDEM_RODADAS.filter((rodada) => porRodada.has(rodada)).map((rodada) => (
          <div key={rodada} className="snap-start shrink-0 flex flex-col gap-4 lg:flex-1 lg:min-w-[14rem]">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wide sticky top-0">{rodada}</h3>
            <div className="flex flex-col gap-4 justify-around flex-1">
              {porRodada.get(rodada)!.map((p) => (
                <BracketMatchNode key={p.id} partida={p} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {terceiroLugar && (
        <div className="pt-4 border-t border-border">
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Disputa de 3º Lugar</h3>
          <BracketMatchNode partida={terceiroLugar} />
        </div>
      )}
    </div>
  )
}
