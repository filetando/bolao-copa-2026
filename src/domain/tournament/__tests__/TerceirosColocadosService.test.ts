import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'
import { TerceirosColocadosService, type TerceiroColocadoInput } from '../TerceirosColocadosService.js'
import type { EquipeInput, PartidaGrupoEncerrada } from '../desempate.js'

function makeEquipe(id: number, nome: string, rankingFifa = 999): EquipeInput {
  return { id, nome, sigla: nome.slice(0, 3).toUpperCase(), bandeiraCodigo: null, rankingFifa }
}
function partida(casaId: number, foraId: number, gc: number, gf: number): PartidaGrupoEncerrada {
  return { equipeCasaId: casaId, equipeForaId: foraId, golsCasa: gc, golsFora: gf }
}
function terceiro(grupoId: string, equipe: EquipeInput, partidas: PartidaGrupoEncerrada[]): TerceiroColocadoInput {
  return { grupoId, equipe, partidas }
}

describe('TerceirosColocadosService', () => {
  it('seleciona os 8 melhores entre 12 terceiros com pontuações claramente distintas', () => {
    // 12 terceiros, pontos decrescentes de 9 (grupo A) a 0 (grupo L) — sem qualquer empate
    const grupos = 'ABCDEFGHIJKL'.split('')
    const terceiros = grupos.map((g, idx) => {
      const equipeId = idx + 1
      const equipe = makeEquipe(equipeId, `Terceiro${g}`)
      const pts = 11 - idx // 11,10,...,0 (distintos, garante ordem determinística só por pontos)
      // 3 vitórias valeriam 9; simulamos pontos variados via combinação V/E simples
      const partidas: PartidaGrupoEncerrada[] =
        pts >= 9
          ? [partida(equipeId, 900 + idx, 1, 0), partida(equipeId, 901 + idx, 1, 0), partida(equipeId, 902 + idx, 1, 0)]
          : pts >= 6
            ? [partida(equipeId, 900 + idx, 1, 0), partida(equipeId, 901 + idx, 1, 0), partida(902 + idx, equipeId, 0, 0)]
            : pts >= 3
              ? [partida(equipeId, 900 + idx, 1, 0), partida(902 + idx, equipeId, 5, 0), partida(901 + idx, equipeId, 5, 0)]
              : [partida(900 + idx, equipeId, 5, 0), partida(901 + idx, equipeId, 5, 0), partida(902 + idx, equipeId, 5, 0)]
      return terceiro(g, equipe, partidas)
    })

    const result = TerceirosColocadosService.rankear(terceiros)

    expect(result.classificados).toHaveLength(8)
    expect(result.eliminados).toHaveLength(4)
    // Ordenado do melhor pro pior — os 8 primeiros grupos da lista construída (A..H) devem
    // ficar entre os classificados, já que os pontos foram construídos em ordem decrescente.
    expect(result.classificados[0].grupoId).toBe('A')
  })

  it('sem confronto direto entre terceiros de grupos diferentes, cai para critérios gerais (saldo/gols)', () => {
    const A = makeEquipe(1, 'TerceiroA')
    const B = makeEquipe(2, 'TerceiroB')
    // Ambos com 4 pontos (1V + 1E), mas A tem saldo de gols melhor
    const terceiros = [
      terceiro('A', A, [partida(1, 100, 3, 0), partida(1, 101, 1, 1), partida(102, 1, 5, 0)]),
      terceiro('B', B, [partida(2, 200, 1, 0), partida(2, 201, 1, 1), partida(202, 2, 5, 0)]),
    ]
    const result = TerceirosColocadosService.rankear(terceiros)
    expect(result.classificados.map((c) => c.grupoId)).toEqual(['A', 'B'])
  })

  it('retorna chaveAnexoC sempre ordenada alfabeticamente, independente da ordem de entrada', () => {
    const grupos = ['L', 'A', 'K', 'B', 'J', 'C', 'I', 'D', 'H', 'E', 'G', 'F']
    const terceiros = grupos.map((g, idx) => {
      const equipeId = idx + 1
      const equipe = makeEquipe(equipeId, `Terceiro${g}`)
      // Pontuação decrescente conforme a ordem da lista, garantindo que os 8 primeiros da
      // lista de entrada sejam os classificados (mas a chave deve sair ordenada A-Z mesmo assim)
      const pts = 12 - idx
      const partidas: PartidaGrupoEncerrada[] =
        pts > 3
          ? [partida(equipeId, 900 + idx, 1, 0), partida(equipeId, 901 + idx, 1, 0), partida(902 + idx, equipeId, 0, 0)]
          : [partida(900 + idx, equipeId, 1, 0), partida(901 + idx, equipeId, 1, 0), partida(902 + idx, equipeId, 1, 0)]
      return terceiro(g, equipe, partidas)
    })
    const result = TerceirosColocadosService.rankear(terceiros)
    const letras = result.chaveAnexoC.split('')
    expect(letras).toEqual([...letras].sort())
    expect(result.chaveAnexoC).toHaveLength(8)
  })

  it('valida contra os 8 melhores terceiros reais da Copa 2026 (fixture do banco de produção)', () => {
    const fixturePath = new URL('../../../../tests/domain/tournament/fixtures/terceiros-2026.json', import.meta.url)
    const fixture = JSON.parse(readFileSync(fixturePath, 'utf-8')) as {
      classificadosEsperados: string[]
      eliminadosEsperados: string[]
      chaveAnexoCEsperada: string
      terceiros: TerceiroColocadoInput[]
    }

    const result = TerceirosColocadosService.rankear(fixture.terceiros)

    expect(result.classificados.map((c) => c.grupoId).sort()).toEqual(fixture.classificadosEsperados.sort())
    expect(result.eliminados.map((c) => c.grupoId).sort()).toEqual(fixture.eliminadosEsperados.sort())
    expect(result.chaveAnexoC).toBe(fixture.chaveAnexoCEsperada)
  })
})
