// DOMAIN_RULES.md §2–§4 — critérios de desempate compartilhados entre ClassificacaoService
// (4 equipes do mesmo grupo) e TerceirosColocadosService (12 terceiros de grupos diferentes).
// Critério 6 (Fair Play) fora de escopo nesta edição — ver DECISIONS_LOG.md ADR-006.

export interface EquipeInput {
  id: number
  nome: string
  sigla: string | null
  bandeiraCodigo: string | null
  rankingFifa: number // menor = melhor posição; usar 999 quando desconhecido
}

export interface PartidaGrupoEncerrada {
  equipeCasaId: number
  equipeForaId: number
  golsCasa: number
  golsFora: number
}

export interface Stats {
  jogos: number
  vitorias: number
  empates: number
  derrotas: number
  golsMarcados: number
  golsSofridos: number
  saldoGols: number
  pontos: number
}

export function emptyStats(): Stats {
  return { jogos: 0, vitorias: 0, empates: 0, derrotas: 0, golsMarcados: 0, golsSofridos: 0, saldoGols: 0, pontos: 0 }
}

export function computeStats(equipes: EquipeInput[], partidas: PartidaGrupoEncerrada[]): Map<number, Stats> {
  const map = new Map<number, Stats>()
  for (const e of equipes) map.set(e.id, emptyStats())

  for (const p of partidas) {
    const casa = map.get(p.equipeCasaId)
    const fora = map.get(p.equipeForaId)
    if (!casa || !fora) continue

    casa.jogos++
    fora.jogos++
    casa.golsMarcados += p.golsCasa
    casa.golsSofridos += p.golsFora
    fora.golsMarcados += p.golsFora
    fora.golsSofridos += p.golsCasa
    casa.saldoGols = casa.golsMarcados - casa.golsSofridos
    fora.saldoGols = fora.golsMarcados - fora.golsSofridos

    if (p.golsCasa > p.golsFora) {
      casa.vitorias++
      casa.pontos += 3
      fora.derrotas++
    } else if (p.golsCasa < p.golsFora) {
      fora.vitorias++
      fora.pontos += 3
      casa.derrotas++
    } else {
      casa.empates++
      casa.pontos++
      fora.empates++
      fora.pontos++
    }
  }

  return map
}

export function computeH2HStats(subset: EquipeInput[], allPartidas: PartidaGrupoEncerrada[]): Map<number, Stats> {
  const ids = new Set(subset.map((e) => e.id))
  const h2h = allPartidas.filter((p) => ids.has(p.equipeCasaId) && ids.has(p.equipeForaId))
  return computeStats(subset, h2h)
}

export function groupByKey<T>(sorted: T[], equal: (a: T, b: T) => boolean): T[][] {
  const groups: T[][] = []
  for (const item of sorted) {
    const last = groups[groups.length - 1]
    if (last && equal(last[0], item)) last.push(item)
    else groups.push([item])
  }
  return groups
}

export function sortByCriteria4Plus(
  subset: EquipeInput[],
  fullStats: Map<number, Stats>,
): EquipeInput[] {
  return [...subset].sort((a, b) => {
    const fa = fullStats.get(a.id)!
    const fb = fullStats.get(b.id)!
    // Critério 4: saldo de gols geral
    if (fa.saldoGols !== fb.saldoGols) return fb.saldoGols - fa.saldoGols
    // Critério 5: gols marcados geral
    if (fa.golsMarcados !== fb.golsMarcados) return fb.golsMarcados - fa.golsMarcados
    // Critério 6: fair play — fora de escopo nesta edição (DECISIONS_LOG.md ADR-006)
    // Critério 7: ranking FIFA (menor = melhor)
    if (a.rankingFifa !== b.rankingFifa) return a.rankingFifa - b.rankingFifa
    // Critério final determinístico: ordem alfabética
    return a.nome.localeCompare(b.nome)
  })
}

// DOMAIN_RULES.md §3 reiteração: se H2H separa apenas 1 de um grupo de 3+, as 2 restantes reiniciam H2H entre si
export function resolveGroup(
  subset: EquipeInput[],
  fullStats: Map<number, Stats>,
  partidas: PartidaGrupoEncerrada[],
  isReiteracao: boolean = false,
): EquipeInput[] {
  if (subset.length <= 1) return subset

  const h2h = computeH2HStats(subset, partidas)

  const sortedByH2H = [...subset].sort((a, b) => {
    const ha = h2h.get(a.id)!
    const hb = h2h.get(b.id)!
    if (ha.pontos !== hb.pontos) return hb.pontos - ha.pontos
    if (ha.saldoGols !== hb.saldoGols) return hb.saldoGols - ha.saldoGols
    return hb.golsMarcados - ha.golsMarcados
  })

  const h2hGroups = groupByKey(sortedByH2H, (a, b) => {
    const ha = h2h.get(a.id)!
    const hb = h2h.get(b.id)!
    return ha.pontos === hb.pontos && ha.saldoGols === hb.saldoGols && ha.golsMarcados === hb.golsMarcados
  })

  const allSameGroup = h2hGroups.length === 1

  if (allSameGroup) {
    // H2H não separou ninguém: critérios 4+
    return sortByCriteria4Plus(subset, fullStats)
  }

  // H2H separou pelo menos 1 equipe
  const result: EquipeInput[] = []
  for (const group of h2hGroups) {
    if (group.length === 1) {
      result.push(group[0])
    } else if (!isReiteracao) {
      // Reiteração: reinicia H2H para o sub-grupo ainda empatado
      result.push(...resolveGroup(group, fullStats, partidas, true))
    } else {
      // Já em reiteração: prossegue para critérios 4+
      result.push(...sortByCriteria4Plus(group, fullStats))
    }
  }
  return result
}
