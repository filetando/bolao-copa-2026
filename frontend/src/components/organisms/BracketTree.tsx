import { BracketMatchNode } from '../molecules/BracketMatchNode.tsx'
import type { Partida } from '../../types/index.ts'

interface BracketTreeProps {
  partidas: Partida[]
}

// Ordem das rodadas do mata-mata (jogos 73-104) — DOMAIN_RULES.md §6. O jogo 103 (3º lugar)
// é renderizado à parte, pois não alimenta nenhuma rodada seguinte.
const ORDEM_RODADAS = ['16-Avos de Final', 'Oitavas de Final', 'Quartas de Final', 'Semifinais', 'Final']
const RODADA_TERCEIRO_LUGAR = 'Terceiro Lugar'
const RODADA_FINAL = 'Final'

// Ordem visual (não a ordem crescente de ID) para que jogos empilhados verticalmente
// correspondam à árvore real do chaveamento — cada par adjacente alimenta o mesmo jogo da
// rodada seguinte (docs/architecture/bracket_dependencias.json / docs/product/copa2026_chaveamento.md).
const ORDEM_VISUAL_16AVOS = [74, 77, 73, 75, 83, 84, 81, 82, 76, 78, 79, 80, 86, 88, 85, 87]
const ORDEM_VISUAL_OITAVAS = [89, 90, 93, 94, 91, 92, 95, 96]
const POSICAO_VISUAL: Record<number, number> = Object.fromEntries(
  [...ORDEM_VISUAL_16AVOS, ...ORDEM_VISUAL_OITAVAS].map((id, idx) => [id, idx]),
)

// O torneio se divide em dois lados que convergem na semifinal 101 (esquerda) e 102
// (direita), e essas duas se encontram na final (104) — mesma topologia do
// docs/product/copa2026_chaveamento.md.
const LADO_ESQUERDO = { dezesseisAvos: [74, 77, 73, 75, 83, 84, 81, 82], oitavas: [89, 90, 93, 94], quartas: [97, 98], semi: 101 }
const LADO_DIREITO = { dezesseisAvos: [76, 78, 79, 80, 86, 88, 85, 87], oitavas: [91, 92, 95, 96], quartas: [99, 100], semi: 102 }

function Coluna({ titulo, partidas, className = '' }: { titulo: string; partidas: Partida[]; className?: string }) {
  return (
    <div className={`shrink-0 flex flex-col gap-4 min-w-[14rem] ${className}`}>
      <h3 className="text-xs font-semibold text-muted uppercase tracking-wide text-center">{titulo}</h3>
      <div className="flex flex-col gap-4 justify-around flex-1">
        {partidas.map((p) => (
          <BracketMatchNode key={p.id} partida={p} />
        ))}
      </div>
    </div>
  )
}

export function BracketTree({ partidas }: BracketTreeProps) {
  const porId = new Map(partidas.map((p) => [p.id, p]))
  const porTodasIds = (ids: number[]) => ids.map((id) => porId.get(id)).filter((p): p is Partida => !!p)

  const porRodada = new Map<string, Partida[]>()
  for (const p of partidas) {
    if (p.faseNome === RODADA_TERCEIRO_LUGAR) continue
    if (!porRodada.has(p.faseNome)) porRodada.set(p.faseNome, [])
    porRodada.get(p.faseNome)!.push(p)
  }
  for (const jogos of porRodada.values()) {
    jogos.sort((a, b) => (POSICAO_VISUAL[a.id] ?? a.id) - (POSICAO_VISUAL[b.id] ?? b.id))
  }

  const terceiroLugar = partidas.find((p) => p.faseNome === RODADA_TERCEIRO_LUGAR)
  const final = porRodada.get(RODADA_FINAL) ?? []
  const semiEsquerda = porTodasIds([LADO_ESQUERDO.semi])
  const semiDireita = porTodasIds([LADO_DIREITO.semi])

  return (
    <div className="space-y-6">
      {/* Mobile/tablet: uma coluna por rodada, com scroll horizontal (não dá pra desenhar os
          dois lados convergindo em telas estreitas sem virar ilegível). */}
      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 lg:hidden">
        {ORDEM_RODADAS.filter((rodada) => porRodada.has(rodada)).map((rodada) => (
          <div key={rodada} className="snap-start shrink-0 flex flex-col gap-4 min-w-[14rem]">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wide">{rodada}</h3>
            <div className="flex flex-col gap-4 justify-around flex-1">
              {porRodada.get(rodada)!.map((p) => (
                <BracketMatchNode key={p.id} partida={p} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: dois lados convergindo para a final no centro. */}
      <div className="hidden lg:flex gap-4 overflow-x-auto pb-2">
        <Coluna titulo="16-Avos" partidas={porTodasIds(LADO_ESQUERDO.dezesseisAvos)} />
        <Coluna titulo="Oitavas" partidas={porTodasIds(LADO_ESQUERDO.oitavas)} />
        <Coluna titulo="Quartas" partidas={porTodasIds(LADO_ESQUERDO.quartas)} />
        <Coluna titulo="Semifinal" partidas={semiEsquerda} className="justify-center" />
        <Coluna titulo="🏆 Final" partidas={final} className="justify-center" />
        <Coluna titulo="Semifinal" partidas={semiDireita} className="justify-center" />
        <Coluna titulo="Quartas" partidas={porTodasIds(LADO_DIREITO.quartas)} />
        <Coluna titulo="Oitavas" partidas={porTodasIds(LADO_DIREITO.oitavas)} />
        <Coluna titulo="16-Avos" partidas={porTodasIds(LADO_DIREITO.dezesseisAvos)} />
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
