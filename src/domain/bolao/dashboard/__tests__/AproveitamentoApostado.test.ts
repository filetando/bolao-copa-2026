import { describe, expect, it } from 'vitest'
import { calcularAproveitamentoApostado } from '../AproveitamentoApostado.js'
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

describe('calcularAproveitamentoApostado', () => {
  it('ignora jogos não apostados no numerador e no denominador', () => {
    const rows = [
      // Placar exato, ×1: 25 pts obtidos de um máximo de 25.
      row({ partidaId: 1, multiplicador: 1, pontosObtidos: 25 }),
      // Só vencedor (base 10), ×2: 20 pts obtidos de um máximo de round(25×2)=50.
      row({
        partidaId: 2,
        multiplicador: 2,
        golsCasa: 2,
        golsFora: 0,
        golsCasaPalpite: 1,
        golsForaPalpite: 0,
        pontosObtidos: 20,
      }),
      // Não apostou — não deve entrar em nada.
      row({ partidaId: 3, multiplicador: 4, golsCasaPalpite: null, golsForaPalpite: null, pontosObtidos: 0 }),
    ]

    const [usuario] = calcularAproveitamentoApostado(rows)

    expect(usuario.totalApostados).toBe(2)
    expect(usuario.pontosObtidos).toBe(45)
    expect(usuario.pontosMaximos).toBe(75)
    expect(usuario.aproveitamento).toBe(60)
  })

  it('usuário que não apostou em nada aparece com 0%, não some do resultado', () => {
    const rows = [row({ usuarioId: 'u2', nome: 'João', golsCasaPalpite: null, golsForaPalpite: null })]

    const [usuario] = calcularAproveitamentoApostado(rows)

    expect(usuario.totalApostados).toBe(0)
    expect(usuario.pontosMaximos).toBe(0)
    expect(usuario.aproveitamento).toBe(0)
  })
})
