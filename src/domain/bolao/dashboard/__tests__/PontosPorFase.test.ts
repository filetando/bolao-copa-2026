import { describe, expect, it } from 'vitest'
import { calcularPontosPorFase } from '../PontosPorFase.js'
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
    ...overrides,
  }
}

describe('calcularPontosPorFase', () => {
  it('soma pontosObtidos por fase e ordena por faseOrdem', () => {
    const rows = [
      row({ partidaId: 1, faseId: 'grupos', faseOrdem: 1, pontosObtidos: 25 }),
      row({ partidaId: 2, faseId: 'grupos', faseOrdem: 1, pontosObtidos: 10 }),
      row({
        partidaId: 104,
        faseId: 'final',
        faseNomeExibicao: 'Final',
        faseOrdem: 7,
        multiplicador: 4,
        pontosObtidos: 100,
      }),
    ]

    const [usuario] = calcularPontosPorFase(rows)

    expect(usuario.fases).toEqual([
      { faseId: 'grupos', faseNomeExibicao: 'Fase de Grupos', faseOrdem: 1, pontos: 35 },
      { faseId: 'final', faseNomeExibicao: 'Final', faseOrdem: 7, pontos: 100 },
    ])
  })

  it('mantém usuários separados', () => {
    const rows = [
      row({ usuarioId: 'u1', pontosObtidos: 25 }),
      row({ usuarioId: 'u2', nome: 'João', pontosObtidos: 10 }),
    ]

    const usuarios = calcularPontosPorFase(rows)

    expect(usuarios.find((u) => u.usuarioId === 'u1')!.fases[0].pontos).toBe(25)
    expect(usuarios.find((u) => u.usuarioId === 'u2')!.fases[0].pontos).toBe(10)
  })
})
