// DOMAIN_RULES.md §2–§3 — classificação da fase de grupos com 7 critérios de desempate em cascata
import {
  computeStats,
  groupByKey,
  resolveGroup,
  type EquipeInput,
  type PartidaGrupoEncerrada,
} from './desempate.js'

export type { EquipeInput, PartidaGrupoEncerrada }

export interface LinhaClassificacao {
  posicao: number
  equipe: { id: number; nome: string; sigla: string | null; bandeiraCodigo: string | null }
  jogos: number
  vitorias: number
  empates: number
  derrotas: number
  golsMarcados: number
  golsSofridos: number
  saldoGols: number
  pontos: number
}

export class ClassificacaoService {
  // DOMAIN_RULES.md §2–§3
  static calcular(equipes: EquipeInput[], partidas: PartidaGrupoEncerrada[]): LinhaClassificacao[] {
    const fullStats = computeStats(equipes, partidas)

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
      else finalOrder.push(...resolveGroup(group, fullStats, partidas))
    }

    return finalOrder.map((equipe, idx) => {
      const s = fullStats.get(equipe.id)!
      return {
        posicao: idx + 1,
        equipe: { id: equipe.id, nome: equipe.nome, sigla: equipe.sigla, bandeiraCodigo: equipe.bandeiraCodigo },
        jogos: s.jogos,
        vitorias: s.vitorias,
        empates: s.empates,
        derrotas: s.derrotas,
        golsMarcados: s.golsMarcados,
        golsSofridos: s.golsSofridos,
        saldoGols: s.saldoGols,
        pontos: s.pontos,
      }
    })
  }
}
