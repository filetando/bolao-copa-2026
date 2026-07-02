// DOMAIN_RULES.md §4 — classificação dos 8 melhores terceiros colocados entre os 12 grupos.
// Reaproveita os mesmos critérios de desempate de ClassificacaoService (exceto o critério 6,
// Fair Play — fora de escopo nesta edição, ver DECISIONS_LOG.md ADR-006), mas comparando
// apenas os 3 jogos de grupo de cada terceiro colocado entre si.
import {
  emptyStats,
  groupByKey,
  resolveGroup,
  type EquipeInput,
  type PartidaGrupoEncerrada,
  type Stats,
} from './desempate.js'

export interface TerceiroColocadoInput {
  grupoId: string
  equipe: EquipeInput
  partidas: PartidaGrupoEncerrada[] // os 3 jogos de grupo dessa equipe (contra 1º/2º/4º do próprio grupo)
}

export interface TerceiroClassificado {
  grupoId: string
  equipe: EquipeInput
}

export interface RankingTerceiros {
  classificados: TerceiroClassificado[] // 8, ordenados por posição (melhor primeiro)
  eliminados: TerceiroClassificado[] // 4
  chaveAnexoC: string // 8 letras de grupo dos classificados, ORDENADAS ALFABETICAMENTE
}

const NUM_CLASSIFICADOS = 8

// Diferente de ClassificacaoService (round-robin completo dentro do grupo), aqui cada terceiro
// colocado só tem seus próprios 3 jogos disponíveis — os adversários (1º/2º/4º do grupo) não
// fazem parte do conjunto comparado. Por isso as estatísticas são calculadas isoladamente por
// equipe a partir de `t.partidas`, não com o computeStats "round-robin" de desempate.ts.
function statsFromPartidasProprias(equipeId: number, partidas: PartidaGrupoEncerrada[]): Stats {
  const stats = emptyStats()
  for (const p of partidas) {
    const golsPro = p.equipeCasaId === equipeId ? p.golsCasa : p.golsFora
    const golsContra = p.equipeCasaId === equipeId ? p.golsFora : p.golsCasa
    stats.jogos++
    stats.golsMarcados += golsPro
    stats.golsSofridos += golsContra
    stats.saldoGols = stats.golsMarcados - stats.golsSofridos
    if (golsPro > golsContra) {
      stats.vitorias++
      stats.pontos += 3
    } else if (golsPro < golsContra) {
      stats.derrotas++
    } else {
      stats.empates++
      stats.pontos++
    }
  }
  return stats
}

export class TerceirosColocadosService {
  // DOMAIN_RULES.md §4 — mesmos critérios 1–5 e 7 de ClassificacaoService, comparando os 12
  // terceiros colocados entre si com base apenas nos seus 3 jogos de grupo.
  static rankear(terceiros: TerceiroColocadoInput[]): RankingTerceiros {
    const equipes = terceiros.map((t) => t.equipe)
    const fullStats = new Map<number, Stats>(
      terceiros.map((t) => [t.equipe.id, statsFromPartidasProprias(t.equipe.id, t.partidas)]),
    )

    // Confronto direto entre terceiros de grupos diferentes normalmente não existe (não se
    // enfrentam na fase de grupos), então o H2H de resolveGroup fica vazio e o critério cai
    // direto para os critérios 4+ (saldo/gols geral → ranking FIFA → alfabética) — mesma
    // lógica de ClassificacaoService, sem duplicação de comportamento.
    const semJogosDiretos: PartidaGrupoEncerrada[] = []

    const sortedByPoints = [...equipes].sort(
      (a, b) => fullStats.get(b.id)!.pontos - fullStats.get(a.id)!.pontos,
    )

    const pointGroups = groupByKey(
      sortedByPoints,
      (a, b) => fullStats.get(a.id)!.pontos === fullStats.get(b.id)!.pontos,
    )

    const finalOrder: EquipeInput[] = []
    for (const group of pointGroups) {
      if (group.length === 1) finalOrder.push(group[0])
      else finalOrder.push(...resolveGroup(group, fullStats, semJogosDiretos))
    }

    const grupoPorEquipeId = new Map(terceiros.map((t) => [t.equipe.id, t.grupoId]))
    const ordenados: TerceiroClassificado[] = finalOrder.map((equipe) => ({
      grupoId: grupoPorEquipeId.get(equipe.id)!,
      equipe,
    }))

    const classificados = ordenados.slice(0, NUM_CLASSIFICADOS)
    const eliminados = ordenados.slice(NUM_CLASSIFICADOS)

    const chaveAnexoC = classificados
      .map((c) => c.grupoId)
      .sort()
      .join('')

    return { classificados, eliminados, chaveAnexoC }
  }
}
