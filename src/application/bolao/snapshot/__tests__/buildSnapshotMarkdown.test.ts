import { describe, it, expect } from 'vitest'
import { buildSnapshotMarkdown } from '../buildSnapshotMarkdown.js'
import type { LeaderboardRow } from '../../use-cases/GetLeaderboard.js'
import type { UltimoPalpiteFinalizadoRow } from '../../ports/PalpiteRepository.js'

const ranking: LeaderboardRow[] = [
  { posicao: 1, usuarioId: 'u1', nome: 'Fulano', totalPontos: 120 },
  { posicao: 2, usuarioId: 'u2', nome: 'Beltrano', totalPontos: 90 },
]

const partidaBase = {
  id: 74,
  faseId: 'oitavas',
  faseNome: 'Oitavas de Final',
  grupoId: null,
  dataHoraUtc: new Date('2026-07-04T21:00:00Z'),
  status: 'encerrada',
  golsCasa: 1,
  golsFora: 1,
  multiplicador: 1.5,
  equipeCasa: { id: 19, nome: 'Alemanha', sigla: 'ALE', bandeiraCodigo: 'DE' },
  equipeFora: { id: 14, nome: 'Paraguai', sigla: 'PAR', bandeiraCodigo: 'PY' },
  placeholderCasa: null,
  placeholderFora: null,
}

const ultimosPalpites: UltimoPalpiteFinalizadoRow[] = [
  {
    usuarioId: 'u1',
    nomeUsuario: 'Fulano',
    golsCasaPalpite: 1,
    golsForaPalpite: 1,
    pontosObtidos: 25,
    partida: partidaBase,
  },
]

describe('buildSnapshotMarkdown', () => {
  it('inclui título com número da partida e motivo (inserção)', () => {
    const md = buildSnapshotMarkdown(ranking, ultimosPalpites, {
      partidaId: 74,
      motivo: 'insercao',
      geradoEm: new Date('2026-07-04T22:00:00Z'),
    })
    expect(md).toContain('# Snapshot — Partida 74 (resultado inserido)')
  })

  it('inclui título com motivo de correção', () => {
    const md = buildSnapshotMarkdown(ranking, ultimosPalpites, {
      partidaId: 74,
      motivo: 'correcao',
      geradoEm: new Date('2026-07-04T22:00:00Z'),
    })
    expect(md).toContain('resultado corrigido')
  })

  it('lista a classificação geral em ordem de posição', () => {
    const md = buildSnapshotMarkdown(ranking, ultimosPalpites, {
      partidaId: 74,
      motivo: 'insercao',
      geradoEm: new Date(),
    })
    expect(md).toContain('| 1 | Fulano | 120 |')
    expect(md).toContain('| 2 | Beltrano | 90 |')
  })

  it('lista o último palpite finalizado de cada usuário com placar real e pontos', () => {
    const md = buildSnapshotMarkdown(ranking, ultimosPalpites, {
      partidaId: 74,
      motivo: 'insercao',
      geradoEm: new Date(),
    })
    expect(md).toContain('### Fulano')
    expect(md).toContain('Alemanha x Paraguai')
    expect(md).toContain('Placar real: 1 x 1')
    expect(md).toContain('Palpite: 1 x 1')
    expect(md).toContain('Pontos obtidos: 25')
  })

  it('lida com listas vazias sem quebrar', () => {
    const md = buildSnapshotMarkdown([], [], { partidaId: 1, motivo: 'insercao', geradoEm: new Date() })
    expect(md).toContain('Nenhum usuário na classificação')
    expect(md).toContain('Nenhum palpite finalizado ainda')
  })
})
