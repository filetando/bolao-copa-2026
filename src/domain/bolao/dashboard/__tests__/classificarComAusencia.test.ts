import { describe, expect, it } from 'vitest'
import { classificarComAusencia } from '../classificarComAusencia.js'
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

describe('classificarComAusencia', () => {
  it('sem palpite (golsCasaPalpite null) retorna erro', () => {
    expect(classificarComAusencia(row({ golsCasaPalpite: null, golsForaPalpite: null }))).toBe('erro')
  })

  it('com palpite, delega pra RegraPontuacao.classificar', () => {
    expect(classificarComAusencia(row({ golsCasaPalpite: 2, golsForaPalpite: 1 }))).toBe('placar_exato')
  })
})
