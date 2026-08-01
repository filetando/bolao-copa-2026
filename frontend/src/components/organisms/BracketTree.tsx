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

function TituloRodada({ titulo }: { titulo: string }) {
  return <h3 className="text-xs font-semibold text-muted uppercase tracking-wide text-center">{titulo}</h3>
}

// O justify-around/justify-center precisa continuar espalhando os CARDS pra manter o desenho
// do chaveamento (pares alinhados com o jogo da rodada seguinte que eles alimentam) — mas o
// título não pode ser um item separado nessa distribuição, senão ele fica preso no topo do
// container enquanto o próprio espaçamento empurra o primeiro card pra longe (rodadas com
// poucos jogos, tipo Semifinal, ficam com um vão enorme entre título e card). Solução: o
// título vai DENTRO do mesmo item flex do primeiro card, então ele "pega carona" na posição
// que o espaçamento calcular pra esse primeiro card, esteja ela onde estiver.
function Coluna({
  titulo,
  partidas,
  alinhamentoCards = 'justify-around',
}: {
  titulo: string
  partidas: Partida[]
  alinhamentoCards?: string
}) {
  return (
    <div className={`shrink-0 flex flex-col gap-4 min-w-[9rem] ${alinhamentoCards}`}>
      {partidas.length === 0 ? (
        <TituloRodada titulo={titulo} />
      ) : (
        partidas.map((p, i) => (
          <div key={p.id} className="flex flex-col gap-2">
            {i === 0 && <TituloRodada titulo={titulo} />}
            <BracketMatchNode partida={p} />
          </div>
        ))
      )}
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
          dois lados convergindo em telas estreitas sem virar ilegível). A final e a disputa
          de 3º lugar ficam juntas na última coluna, o 3º lugar embaixo da final. */}
      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 lg:hidden">
        {ORDEM_RODADAS.filter((rodada) => porRodada.has(rodada)).map((rodada) => (
          <div key={rodada} className="snap-start shrink-0 flex flex-col gap-4 min-w-[9rem] justify-around">
            {porRodada.get(rodada)!.map((p, i) => (
              <div key={p.id} className="flex flex-col gap-2">
                {i === 0 && <TituloRodada titulo={rodada} />}
                <BracketMatchNode partida={p} />
              </div>
            ))}
            {rodada === RODADA_FINAL && terceiroLugar && (
              <div className="pt-3 border-t border-border">
                <h4 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">3º Lugar</h4>
                <BracketMatchNode partida={terceiroLugar} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop: dois lados convergindo para a final no centro; 3º lugar logo abaixo dela. */}
      <div className="hidden lg:flex gap-4 overflow-x-auto pb-2">
        <Coluna titulo="16-Avos" partidas={porTodasIds(LADO_ESQUERDO.dezesseisAvos)} />
        <Coluna titulo="Oitavas" partidas={porTodasIds(LADO_ESQUERDO.oitavas)} />
        <Coluna titulo="Quartas" partidas={porTodasIds(LADO_ESQUERDO.quartas)} />
        <Coluna titulo="Semifinal" partidas={semiEsquerda} alinhamentoCards="justify-center" />
        <div className="shrink-0 flex flex-col gap-4 min-w-[9rem] justify-center">
          {final.length === 0 ? (
            <TituloRodada titulo="🏆 Final" />
          ) : (
            final.map((p, i) => (
              <div key={p.id} className="flex flex-col items-center gap-2 w-full">
                {i === 0 && <TituloRodada titulo="🏆 Final" />}
                <BracketMatchNode partida={p} />
              </div>
            ))
          )}
          {terceiroLugar && (
            <div className="w-full pt-4 border-t border-border">
              <h4 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 text-center">3º Lugar</h4>
              <BracketMatchNode partida={terceiroLugar} />
            </div>
          )}
        </div>
        <Coluna titulo="Semifinal" partidas={semiDireita} alinhamentoCards="justify-center" />
        <Coluna titulo="Quartas" partidas={porTodasIds(LADO_DIREITO.quartas)} />
        <Coluna titulo="Oitavas" partidas={porTodasIds(LADO_DIREITO.oitavas)} />
        <Coluna titulo="16-Avos" partidas={porTodasIds(LADO_DIREITO.dezesseisAvos)} />
      </div>
    </div>
  )
}
