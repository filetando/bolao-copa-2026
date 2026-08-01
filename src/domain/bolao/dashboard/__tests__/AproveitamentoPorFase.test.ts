import { describe, expect, it } from 'vitest'
import { calcularAproveitamentoPorFase } from '../AproveitamentoPorFase.js'
import type { DetalhePalpiteRow } from '../DetalhePalpiteRow.js'

function row(overrides: Partial<DetalhePalpiteRow>): DetalhePalpiteRow {
  return {
    usuarioId: 'u1',
    nome: 'Lucas',
    partidaId: 1,
    faseId: 'quartas',
    faseNomeExibicao: 'Quartas de Final',
    faseOrdem: 4,
    multiplicador: 2,
    golsCasa: 2,
    golsFora: 1,
    golsCasaPalpite: 2,
    golsForaPalpite: 1,
    pontosObtidos: 50,
    dataHoraUtc: '2026-07-01T19:00:00Z',
    equipeCasaSigla: 'MEX',
    equipeForaSigla: 'AFS',
    ...overrides,
  }
}

describe('calcularAproveitamentoPorFase', () => {
  it('máximo possível = round(25 × multiplicador) × nº de jogos da fase', () => {
    // Fase com multiplicador 2 e 2 jogos distintos → max = round(25×2) × 2 = 100
    // Usuário fez 50 pts → aproveitamento = 50%
    const rows = [
      row({ partidaId: 1, usuarioId: 'u1', pontosObtidos: 25 }),
      row({ partidaId: 2, usuarioId: 'u1', pontosObtidos: 25 }),
    ]

    const [fase] = calcularAproveitamentoPorFase(rows)

    expect(fase.maxPossivel).toBe(100)
    expect(fase.usuarios).toEqual([{ usuarioId: 'u1', nome: 'Lucas', pontos: 50, aproveitamento: 50 }])
  })

  it('multiplicador ×1.5 arredonda antes de multiplicar pelo nº de jogos', () => {
    // round(25×1.5) = 38, × 1 jogo = 38 de máximo
    const rows = [row({ partidaId: 1, faseId: '16avos', faseOrdem: 2, multiplicador: 1.5, pontosObtidos: 27 })]

    const [fase] = calcularAproveitamentoPorFase(rows)

    expect(fase.maxPossivel).toBe(38)
  })

  it('ordena fases por faseOrdem', () => {
    const rows = [
      row({ partidaId: 1, faseId: 'final', faseOrdem: 7, multiplicador: 4 }),
      row({ partidaId: 2, faseId: 'grupos', faseOrdem: 1, multiplicador: 1 }),
    ]

    const fases = calcularAproveitamentoPorFase(rows)

    expect(fases.map((f) => f.faseId)).toEqual(['grupos', 'final'])
  })
})
