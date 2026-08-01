import { describe, expect, it } from 'vitest'
import { calcularPerfilAcerto } from '../PerfilAcerto.js'
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

describe('calcularPerfilAcerto', () => {
  it('divide os palpites de um usuário em categorias com percentual correto', () => {
    // 1 placar exato + 1 erro = 2 palpites → 50% cada, 0% no resto
    const rows = [
      row({ partidaId: 1, golsCasaPalpite: 2, golsForaPalpite: 1, golsCasa: 2, golsFora: 1 }),
      row({ partidaId: 2, golsCasaPalpite: 0, golsForaPalpite: 1, golsCasa: 2, golsFora: 1 }),
    ]

    const [perfil] = calcularPerfilAcerto(rows)

    expect(perfil.usuarioId).toBe('u1')
    expect(perfil.totalPalpites).toBe(2)
    expect(perfil.categorias.placar_exato).toEqual({ quantidade: 1, percentual: 50 })
    expect(perfil.categorias.erro).toEqual({ quantidade: 1, percentual: 50 })
    expect(perfil.categorias.vencedor_gols).toEqual({ quantidade: 0, percentual: 0 })
  })

  it('não apostar (golsCasaPalpite null) conta como erro, não é excluído do total', () => {
    // 1 placar exato + 1 não-apostado = 2 palpites → 50% placar_exato, 50% erro
    const rows = [
      row({ partidaId: 1, golsCasaPalpite: 2, golsForaPalpite: 1, golsCasa: 2, golsFora: 1 }),
      row({ partidaId: 2, golsCasaPalpite: null, golsForaPalpite: null, golsCasa: 2, golsFora: 1 }),
    ]

    const [perfil] = calcularPerfilAcerto(rows)

    expect(perfil.totalPalpites).toBe(2)
    expect(perfil.categorias.placar_exato).toEqual({ quantidade: 1, percentual: 50 })
    expect(perfil.categorias.erro).toEqual({ quantidade: 1, percentual: 50 })
  })

  it('separa usuários distintos', () => {
    const rows = [
      row({ usuarioId: 'u1', nome: 'Lucas' }),
      row({ usuarioId: 'u2', nome: 'João', golsCasaPalpite: 0, golsForaPalpite: 0 }),
    ]

    const perfis = calcularPerfilAcerto(rows)

    expect(perfis).toHaveLength(2)
    expect(perfis.map((p) => p.usuarioId).sort()).toEqual(['u1', 'u2'])
  })
})
