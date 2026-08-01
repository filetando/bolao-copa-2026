import { describe, expect, it } from 'vitest'
import { calcularTaxaAcerto } from '../TaxaAcerto.js'
import type { DetalhePalpiteRow } from '../DetalhePalpiteRow.js'

function row(overrides: Partial<DetalhePalpiteRow>): DetalhePalpiteRow {
  return {
    usuarioId: 'u1',
    nome: 'Lucas',
    partidaId: 1,
    faseId: 'grupos',
    faseNomeExibicao: 'Fase de Grupos',
    faseOrdem: 1,
    multiplicador: 1,
    golsCasa: 2,
    golsFora: 1,
    golsCasaPalpite: 2,
    golsForaPalpite: 1,
    pontosObtidos: 25,
    dataHoraUtc: '2026-06-11T19:00:00Z',
    equipeCasaSigla: 'MEX',
    equipeForaSigla: 'AFS',
    ...overrides,
  }
}

describe('calcularTaxaAcerto', () => {
  it('ignora partidas não apostadas no denominador (2 apostados, 1 acerto → 50%)', () => {
    const rows = [
      row({ partidaId: 1, golsCasaPalpite: 2, golsForaPalpite: 1, golsCasa: 2, golsFora: 1 }), // acerto
      row({ partidaId: 2, golsCasaPalpite: 0, golsForaPalpite: 1, golsCasa: 2, golsFora: 1 }), // erro
      row({ partidaId: 3, golsCasaPalpite: null, golsForaPalpite: null }), // não apostou — fora do denominador
    ]

    const [usuario] = calcularTaxaAcerto(rows)

    expect(usuario.totalApostados).toBe(2)
    expect(usuario.acertos).toBe(1)
    expect(usuario.taxaAcerto).toBe(50)
  })

  it('usuário que não apostou em nada não aparece com taxa dividida por zero', () => {
    const rows = [row({ usuarioId: 'u2', nome: 'João', golsCasaPalpite: null, golsForaPalpite: null })]

    const [usuario] = calcularTaxaAcerto(rows)

    expect(usuario.totalApostados).toBe(0)
    expect(usuario.taxaAcerto).toBe(0)
  })
})
