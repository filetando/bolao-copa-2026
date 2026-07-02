import { describe, it, expect, vi } from 'vitest'
import { SaveStandingsSnapshot } from '../use-cases/SaveStandingsSnapshot.js'
import type { LeaderboardRepository } from '../ports/LeaderboardRepository.js'
import type { PalpiteRepository, UltimoPalpiteFinalizadoRow } from '../ports/PalpiteRepository.js'
import type { SnapshotWriter } from '../ports/SnapshotWriter.js'

function makeLeaderboardRepo(): LeaderboardRepository {
  return {
    findRanking: vi.fn().mockResolvedValue([{ usuarioId: 'u1', nome: 'Fulano', totalPontos: 100 }]),
    findHistoricoPontos: vi.fn(),
  }
}

function makePalpiteRepo(ultimos: UltimoPalpiteFinalizadoRow[] = []): PalpiteRepository {
  return {
    upsert: vi.fn(),
    findByUsuario: vi.fn(),
    findByPartida: vi.fn(),
    updatePontosObtidos: vi.fn(),
    findById: vi.fn(),
    findByUsuarioWithPartida: vi.fn(),
    updateGols: vi.fn(),
    findAllPartidasWithPalpiteForUser: vi.fn(),
    findUltimosPalpitesFinalizados: vi.fn().mockResolvedValue(ultimos),
  }
}

describe('SaveStandingsSnapshot', () => {
  it('busca ranking e últimos palpites finalizados, gera markdown e salva via SnapshotWriter', async () => {
    const leaderboardRepo = makeLeaderboardRepo()
    const palpiteRepo = makePalpiteRepo()
    const snapshotWriter: SnapshotWriter = { save: vi.fn().mockResolvedValue('/snapshots/arquivo.md') }
    const clock = () => new Date('2026-07-04T22:00:00Z')

    const useCase = new SaveStandingsSnapshot(leaderboardRepo, palpiteRepo, snapshotWriter, clock)
    const result = await useCase.execute({ partidaId: 74, motivo: 'insercao' })

    expect(leaderboardRepo.findRanking).toHaveBeenCalledOnce()
    expect(palpiteRepo.findUltimosPalpitesFinalizados).toHaveBeenCalledOnce()
    expect(snapshotWriter.save).toHaveBeenCalledOnce()
    const [filename, content] = (snapshotWriter.save as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(filename).toContain('partida-74')
    expect(filename).toContain('insercao')
    expect(content).toContain('Fulano')
    expect(result.path).toBe('/snapshots/arquivo.md')
  })

  it('nome do arquivo reflete o motivo de correção', async () => {
    const snapshotWriter: SnapshotWriter = { save: vi.fn().mockResolvedValue('/x.md') }
    const useCase = new SaveStandingsSnapshot(
      makeLeaderboardRepo(),
      makePalpiteRepo(),
      snapshotWriter,
      () => new Date('2026-07-04T22:00:00Z'),
    )
    await useCase.execute({ partidaId: 89, motivo: 'correcao' })
    const [filename] = (snapshotWriter.save as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(filename).toContain('correcao')
    expect(filename).toContain('partida-89')
  })
})
