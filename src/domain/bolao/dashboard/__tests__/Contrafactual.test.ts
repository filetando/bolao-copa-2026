import { describe, expect, it } from 'vitest'
import { calcularContrafactual } from '../Contrafactual.js'
import type { DetalhePalpiteRow } from '../DetalhePalpiteRow.js'

function row(overrides: Partial<DetalhePalpiteRow>): DetalhePalpiteRow {
  return {
    usuarioId: 'u1',
    nome: 'Lucas',
    partidaId: 104,
    faseId: 'final',
    faseNomeExibicao: 'Final',
    faseOrdem: 7,
    multiplicador: 4,
    golsCasa: 2,
    golsFora: 1,
    golsCasaPalpite: 2,
    golsForaPalpite: 1,
    pontosObtidos: 100,
    dataHoraUtc: '2026-07-19T19:00:00Z',
    equipeCasaSigla: 'BRA',
    equipeForaSigla: 'ARG',
    ...overrides,
  }
}

describe('calcularContrafactual', () => {
  it('placar exato na final (×4): real 100, sem multiplicador 25', () => {
    const [usuario] = calcularContrafactual([row({})])

    expect(usuario.pontosReais).toBe(100)
    expect(usuario.pontosSemMultiplicador).toBe(25)
  })

  it('soma corretamente ao longo de várias partidas e fases', () => {
    const rows = [
      row({ partidaId: 104, multiplicador: 4, pontosObtidos: 100 }), // placar exato ×4 = 100 real, 25 em 1x
      row({
        partidaId: 1,
        faseId: 'grupos',
        faseOrdem: 1,
        multiplicador: 1,
        golsCasa: 1,
        golsFora: 0,
        golsCasaPalpite: 1,
        golsForaPalpite: 0,
        pontosObtidos: 25,
      }), // placar exato ×1 = 25 real, 25 em 1x
    ]

    const [usuario] = calcularContrafactual(rows)

    expect(usuario.pontosReais).toBe(125)
    expect(usuario.pontosSemMultiplicador).toBe(50)
  })

  it('não apostar conta 0 dos dois lados, mesmo com multiplicador alto', () => {
    const [usuario] = calcularContrafactual([row({ golsCasaPalpite: null, golsForaPalpite: null, pontosObtidos: 0 })])

    expect(usuario.pontosReais).toBe(0)
    expect(usuario.pontosSemMultiplicador).toBe(0)
  })
})
