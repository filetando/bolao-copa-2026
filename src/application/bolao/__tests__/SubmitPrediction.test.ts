import { describe, expect, it, vi } from 'vitest'
import { SubmitPrediction } from '../use-cases/SubmitPrediction.js'
import { PredictionLockedError, MatchNotFoundError } from '../../../domain/bolao/errors.js'
import { LOCK_WINDOW_MS } from '../../../domain/bolao/Palpite.js'
import type { TournamentReadPort, PartidaInfo } from '../ports/TournamentReadPort.js'
import type { PalpiteRepository, PalpiteData } from '../ports/PalpiteRepository.js'

// Arrange helpers
function makePartida(overrides: Partial<PartidaInfo> = {}): PartidaInfo {
  return {
    id: 1,
    dataHoraUtc: new Date(Date.now() + 2 * 60 * 60_000), // 2h from now (default safe)
    status: 'agendada',
    grupoSimultaneoId: null,
    golsCasa: null,
    golsFora: null,
    multiplicador: 1,
    ...overrides,
  }
}

function makeTournament(partida: PartidaInfo | null, minCutoff?: Date): TournamentReadPort {
  return {
    getPartida: vi.fn().mockResolvedValue(partida),
    getMinDataHoraUtcForGrupoSimultaneo: vi.fn().mockResolvedValue(minCutoff ?? new Date()),
  }
}

function makePalpiteRepo(): PalpiteRepository {
  const result: PalpiteData = {
    id: 'palpite-1',
    usuarioId: 'user-1',
    partidaId: 1,
    golsCasaPalpite: 2,
    golsForaPalpite: 1,
    pontosObtidos: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  return {
    upsert: vi.fn().mockResolvedValue(result),
    findByUsuario: vi.fn().mockResolvedValue([]),
    findByPartida: vi.fn().mockResolvedValue([]),
    updatePontosObtidos: vi.fn().mockResolvedValue(undefined),
  }
}

const defaultInput = { usuarioId: 'user-1', partidaId: 1, golsCasaPalpite: 2, golsForaPalpite: 1 }

describe('SubmitPrediction', () => {
  it('throws MatchNotFoundError when partida does not exist', async () => {
    const uc = new SubmitPrediction(makePalpiteRepo(), makeTournament(null))
    await expect(uc.execute(defaultInput)).rejects.toThrow(MatchNotFoundError)
  })

  it('throws PredictionLockedError when cutoff is inside lock window (no simultaneous group)', async () => {
    // cutoff = now + (LOCK_WINDOW - 3 min) → 3 min inside the window → locked
    const cutoff = new Date(Date.now() + LOCK_WINDOW_MS - 3 * 60_000)
    const uc = new SubmitPrediction(makePalpiteRepo(), makeTournament(makePartida({ dataHoraUtc: cutoff, grupoSimultaneoId: null })))
    await expect(uc.execute(defaultInput)).rejects.toThrow(PredictionLockedError)
  })

  it('uses the minimum dataHoraUtc of the simultaneous group as cutoff', async () => {
    // Partida itself is 2h away, but the group's min cutoff is 3 min away → locked
    const minCutoff = new Date(Date.now() + LOCK_WINDOW_MS - 3 * 60_000)
    const partida = makePartida({ grupoSimultaneoId: 5 })
    const tournament = makeTournament(partida, minCutoff)
    const uc = new SubmitPrediction(makePalpiteRepo(), tournament)
    await expect(uc.execute(defaultInput)).rejects.toThrow(PredictionLockedError)
    expect(tournament.getMinDataHoraUtcForGrupoSimultaneo).toHaveBeenCalledWith(5)
  })

  it('saves palpite when within valid submission window (no simultaneous group)', async () => {
    const cutoff = new Date(Date.now() + LOCK_WINDOW_MS + 60_000) // outside lock window
    const repo = makePalpiteRepo()
    const uc = new SubmitPrediction(repo, makeTournament(makePartida({ dataHoraUtc: cutoff })))
    const result = await uc.execute(defaultInput)
    expect(repo.upsert).toHaveBeenCalledOnce()
    expect(repo.upsert).toHaveBeenCalledWith(expect.objectContaining({
      usuarioId: 'user-1',
      partidaId: 1,
      golsCasaPalpite: 2,
      golsForaPalpite: 1,
    }))
    expect(result.golsCasaPalpite).toBe(2)
  })

  it('saves palpite for simultaneous group when min cutoff is outside lock window', async () => {
    const minCutoff = new Date(Date.now() + LOCK_WINDOW_MS + 60_000) // outside lock window
    const partida = makePartida({ grupoSimultaneoId: 5 })
    const repo = makePalpiteRepo()
    const uc = new SubmitPrediction(repo, makeTournament(partida, minCutoff))
    await uc.execute(defaultInput)
    expect(repo.upsert).toHaveBeenCalledOnce()
  })
})
