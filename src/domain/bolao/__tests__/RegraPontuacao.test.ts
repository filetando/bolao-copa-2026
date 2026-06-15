import { describe, expect, it } from 'vitest'
import { RegraPontuacao } from '../RegraPontuacao.js'

// DOMAIN_RULES.md §7 — cascata de pontuação do bolão
describe('RegraPontuacao.calcular', () => {
  // Categoria 1: Placar exato → 25 pts base
  it('placar exato retorna 25 × mult', () => {
    expect(RegraPontuacao.calcular({ golsCasa: 2, golsFora: 1 }, { golsCasa: 2, golsFora: 1 }, 1)).toBe(25)
  })

  // Categoria 2: Vencedor correto + gols do vencedor batem (perdedor errado) → 18 pts base
  it('vencedor correto e gols do vencedor batem retorna 18 × mult', () => {
    // resultado 2×1, palpite 2×0: gols casa (vencedor)=2 batem; fora (perdedor) errado
    expect(RegraPontuacao.calcular({ golsCasa: 2, golsFora: 1 }, { golsCasa: 2, golsFora: 0 }, 1)).toBe(18)
  })

  // Categoria 3: Vencedor correto + saldo de gols bate (placar não) → 15 pts base
  it('vencedor correto e saldo de gols bate retorna 15 × mult', () => {
    // resultado 2×0 (saldo +2), palpite 3×1 (saldo +2): vencedor certo, saldo bate, placar não
    expect(RegraPontuacao.calcular({ golsCasa: 2, golsFora: 0 }, { golsCasa: 3, golsFora: 1 }, 1)).toBe(15)
  })

  // Categoria 4: Empate palpitado + resultado empate, placares diferentes → 15 pts base
  it('empate × empate com placares diferentes retorna 15 × mult', () => {
    expect(RegraPontuacao.calcular({ golsCasa: 1, golsFora: 1 }, { golsCasa: 2, golsFora: 2 }, 1)).toBe(15)
  })

  // Categoria 5: Só vencedor correto → 10 pts base
  it('só vencedor correto retorna 10 × mult', () => {
    // resultado 2×0, palpite 1×0: vencedor certo (casa), gols não batem, saldo não bate
    expect(RegraPontuacao.calcular({ golsCasa: 2, golsFora: 0 }, { golsCasa: 1, golsFora: 0 }, 1)).toBe(10)
  })

  // Categoria 6: Erro total → 0 pts
  it('vencedor errado retorna 0', () => {
    // resultado 2×1 (casa vence), palpite 0×1 (fora vence)
    expect(RegraPontuacao.calcular({ golsCasa: 2, golsFora: 1 }, { golsCasa: 0, golsFora: 1 }, 1)).toBe(0)
  })

  // Fronteira: palpite empate, resultado vitória → não cai em categoria 5 (vencedores diferentes)
  it('palpite empate com resultado vitória retorna 0', () => {
    expect(RegraPontuacao.calcular({ golsCasa: 2, golsFora: 1 }, { golsCasa: 1, golsFora: 1 }, 1)).toBe(0)
  })

  // Multiplicadores
  it('multiplicador ×2 com placar exato retorna 50', () => {
    // Math.round(25 × 2) = 50
    expect(RegraPontuacao.calcular({ golsCasa: 2, golsFora: 1 }, { golsCasa: 2, golsFora: 1 }, 2)).toBe(50)
  })

  it('multiplicador ×1.5 com só vencedor retorna 15', () => {
    // Math.round(10 × 1.5) = 15
    expect(RegraPontuacao.calcular({ golsCasa: 2, golsFora: 0 }, { golsCasa: 1, golsFora: 0 }, 1.5)).toBe(15)
  })
})
