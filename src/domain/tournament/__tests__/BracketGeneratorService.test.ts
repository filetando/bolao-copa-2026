import { describe, it, expect } from 'vitest'
import { BracketGeneratorService } from '../BracketGeneratorService.js'
import type { ConfrontoTerceiro } from '../AnexoCLookup.js'

// Conjunto sintético: equipeId = 100 + índice do grupo (A=1..L=12) para 1º; 200+ para 2º;
// 300+ para os terceiros classificados, indexados pela própria letra do grupo de origem.
const grupos = 'ABCDEFGHIJKL'.split('')
const primeiros = Object.fromEntries(grupos.map((g, i) => [g, 100 + i]))
const segundos = Object.fromEntries(grupos.map((g, i) => [g, 200 + i]))
// Só os 8 grupos que fornecem 3º colocado classificado nesta combinação fictícia
const terceirosClassificados = Object.fromEntries(
  ['B', 'D', 'E', 'F', 'I', 'J', 'K', 'L'].map((g) => [g, 300 + grupos.indexOf(g)]),
)
const confrontoAnexoC: ConfrontoTerceiro = {
  vs1a: 'E',
  vs1b: 'J',
  vs1d: 'B',
  vs1e: 'D',
  vs1g: 'I',
  vs1i: 'F',
  vs1k: 'L',
  vs1l: 'K',
}

describe('BracketGeneratorService', () => {
  it('gera os 16 confrontos oficiais dos jogos 73-88 (bolao-copa-2026_1.md §6)', () => {
    const confrontos = BracketGeneratorService.gerar(primeiros, segundos, terceirosClassificados, confrontoAnexoC)
    const byId = new Map(confrontos.map((c) => [c.partidaId, c]))

    expect(confrontos).toHaveLength(16)

    // Jogos fixos 2º × 2º (não usam Anexo C)
    expect(byId.get(73)).toEqual({ partidaId: 73, equipeCasaId: segundos.A, equipeForaId: segundos.B })
    expect(byId.get(78)).toEqual({ partidaId: 78, equipeCasaId: segundos.E, equipeForaId: segundos.I })
    expect(byId.get(83)).toEqual({ partidaId: 83, equipeCasaId: segundos.K, equipeForaId: segundos.L })
    expect(byId.get(88)).toEqual({ partidaId: 88, equipeCasaId: segundos.D, equipeForaId: segundos.G })

    // Jogos fixos C/F/H/J × 2º colocado (regra fixa, DOMAIN_RULES.md §5)
    expect(byId.get(75)).toEqual({ partidaId: 75, equipeCasaId: primeiros.F, equipeForaId: segundos.C })
    expect(byId.get(76)).toEqual({ partidaId: 76, equipeCasaId: primeiros.C, equipeForaId: segundos.F })
    expect(byId.get(84)).toEqual({ partidaId: 84, equipeCasaId: primeiros.H, equipeForaId: segundos.J })
    expect(byId.get(86)).toEqual({ partidaId: 86, equipeCasaId: primeiros.J, equipeForaId: segundos.H })

    // Jogos via Anexo C (A/B/D/E/G/I/K/L × melhor 3º)
    expect(byId.get(74)).toEqual({ partidaId: 74, equipeCasaId: primeiros.E, equipeForaId: terceirosClassificados.D })
    expect(byId.get(77)).toEqual({ partidaId: 77, equipeCasaId: primeiros.I, equipeForaId: terceirosClassificados.F })
    expect(byId.get(79)).toEqual({ partidaId: 79, equipeCasaId: primeiros.A, equipeForaId: terceirosClassificados.E })
    expect(byId.get(80)).toEqual({ partidaId: 80, equipeCasaId: primeiros.L, equipeForaId: terceirosClassificados.K })
    expect(byId.get(81)).toEqual({ partidaId: 81, equipeCasaId: primeiros.D, equipeForaId: terceirosClassificados.B })
    expect(byId.get(82)).toEqual({ partidaId: 82, equipeCasaId: primeiros.G, equipeForaId: terceirosClassificados.I })
    expect(byId.get(85)).toEqual({ partidaId: 85, equipeCasaId: primeiros.B, equipeForaId: terceirosClassificados.J })
    expect(byId.get(87)).toEqual({ partidaId: 87, equipeCasaId: primeiros.K, equipeForaId: terceirosClassificados.L })
  })

  it('resolve com os dados reais da Copa 2026 (banco de produção, combinação BDEFIJKL)', () => {
    const primeirosReais = { A: 1, B: 8, C: 11, D: 13, E: 19, F: 21, G: 27, H: 31, I: 33, J: 37, K: 44, L: 47 }
    const segundosReais = { A: 2, B: 5, C: 12, D: 15, E: 17, F: 22, G: 28, H: 32, I: 36, J: 39, K: 41, L: 48 }
    const terceirosReais = { B: 6, D: 14, E: 18, F: 23, I: 34, J: 38, K: 42, L: 45 }
    const confrontos = BracketGeneratorService.gerar(primeirosReais, segundosReais, terceirosReais, confrontoAnexoC)
    const byId = new Map(confrontos.map((c) => [c.partidaId, c]))

    expect(byId.get(74)).toEqual({ partidaId: 74, equipeCasaId: 19, equipeForaId: 14 }) // 1ºE x 3ºD (vs1e=D)
    expect(byId.get(79)).toEqual({ partidaId: 79, equipeCasaId: 1, equipeForaId: 18 }) // 1ºA x 3ºE (vs1a=E)
    expect(byId.get(87)).toEqual({ partidaId: 87, equipeCasaId: 44, equipeForaId: 45 }) // 1ºK x 3ºL (vs1k=L)
  })
})
