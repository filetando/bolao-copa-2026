import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RegisterMatchResult } from '../use-cases/RegisterMatchResult.js'
import { BracketPropagationService } from '../../../domain/tournament/BracketPropagationService.js'
import { MatchNotFoundError, PenaltyWinnerRequiredError } from '../../../domain/tournament/errors.js'
import type { PartidaBasica, PartidaRepository } from '../ports/PartidaRepository.js'

const dependencias = {
  '89': { casa: { tipo: 'vencedor' as const, jogo: 74 }, fora: { tipo: 'vencedor' as const, jogo: 77 } },
  '103': { casa: { tipo: 'perdedor' as const, jogo: 101 }, fora: { tipo: 'perdedor' as const, jogo: 102 } },
  '104': { casa: { tipo: 'vencedor' as const, jogo: 101 }, fora: { tipo: 'vencedor' as const, jogo: 102 } },
}

function makeRepo(partida: PartidaBasica | null): PartidaRepository {
  return {
    findAllOrderedByDate: vi.fn(),
    findMataMata: vi.fn(),
    findById: vi.fn().mockResolvedValue(partida),
    registerResult: vi.fn().mockResolvedValue(undefined),
    updateEquipesResolvidas: vi.fn().mockResolvedValue(undefined),
    resolverLadosPartidas: vi.fn().mockResolvedValue(undefined),
  }
}

describe('RegisterMatchResult', () => {
  let bracketPropagation: BracketPropagationService

  beforeEach(() => {
    bracketPropagation = new BracketPropagationService(dependencias)
  })

  it('lança MatchNotFoundError se a partida não existir', async () => {
    const repo = makeRepo(null)
    const useCase = new RegisterMatchResult(repo, bracketPropagation)
    await expect(
      useCase.execute({ adminId: 'a', partidaId: 999, golsCasa: 1, golsFora: 0 }),
    ).rejects.toThrow(MatchNotFoundError)
  })

  it('jogo de mata-mata empatado sem vencedorPenaltisEquipeId lança PenaltyWinnerRequiredError', async () => {
    const repo = makeRepo({ id: 89, faseId: 'oitavas', equipeCasaId: 10, equipeForaId: 20, status: 'agendada' })
    const useCase = new RegisterMatchResult(repo, bracketPropagation)
    await expect(
      useCase.execute({ adminId: 'a', partidaId: 89, golsCasa: 1, golsFora: 1 }),
    ).rejects.toThrow(PenaltyWinnerRequiredError)
  })

  it('jogo de grupos empatado nunca exige vencedorPenaltisEquipeId (regressão)', async () => {
    const repo = makeRepo({ id: 1, faseId: 'grupos', equipeCasaId: 10, equipeForaId: 20, status: 'agendada' })
    const useCase = new RegisterMatchResult(repo, bracketPropagation)
    await useCase.execute({ adminId: 'a', partidaId: 1, golsCasa: 1, golsFora: 1 })
    expect(repo.registerResult).toHaveBeenCalledWith(1, 1, 1, undefined)
    expect(repo.resolverLadosPartidas).not.toHaveBeenCalled()
  })

  it('jogo de mata-mata empatado com vencedorPenaltisEquipeId propaga o vencedor certo', async () => {
    const repo = makeRepo({ id: 89, faseId: 'oitavas', equipeCasaId: 10, equipeForaId: 20, status: 'agendada' })
    const useCase = new RegisterMatchResult(repo, bracketPropagation)
    await useCase.execute({ adminId: 'a', partidaId: 89, golsCasa: 1, golsFora: 1, vencedorPenaltisEquipeId: 20 })
    expect(repo.registerResult).toHaveBeenCalledWith(89, 1, 1, 20)
    // jogo 89 não tem dependentes no mapa reduzido de teste — sem propagação aqui
    expect(repo.resolverLadosPartidas).not.toHaveBeenCalled()
  })

  it('vencedor sem empate propaga corretamente (sem exigir pênaltis)', async () => {
    const repo = makeRepo({ id: 74, faseId: 'oitavas', equipeCasaId: 5, equipeForaId: 6, status: 'agendada' })
    const useCase = new RegisterMatchResult(repo, bracketPropagation)
    await useCase.execute({ adminId: 'a', partidaId: 74, golsCasa: 2, golsFora: 0 })
    expect(repo.registerResult).toHaveBeenCalledWith(74, 2, 0, undefined)
    expect(repo.resolverLadosPartidas).toHaveBeenCalledWith([{ partidaId: 89, lado: 'casa', equipeId: 5 }])
  })

  it('semifinal (101) resolvida por pênaltis propaga fan-out para 103 (perdedor) e 104 (vencedor)', async () => {
    const repo = makeRepo({ id: 101, faseId: 'semifinal', equipeCasaId: 1, equipeForaId: 2, status: 'agendada' })
    const useCase = new RegisterMatchResult(repo, bracketPropagation)
    await useCase.execute({ adminId: 'a', partidaId: 101, golsCasa: 1, golsFora: 1, vencedorPenaltisEquipeId: 1 })
    expect(repo.resolverLadosPartidas).toHaveBeenCalledWith(
      expect.arrayContaining([
        { partidaId: 104, lado: 'casa', equipeId: 1 },
        { partidaId: 103, lado: 'casa', equipeId: 2 },
      ]),
    )
  })

  it('não propaga se algum lado da partida ainda não estiver resolvido (equipeCasaId/equipeForaId null)', async () => {
    const repo = makeRepo({ id: 89, faseId: 'oitavas', equipeCasaId: null, equipeForaId: 20, status: 'agendada' })
    const useCase = new RegisterMatchResult(repo, bracketPropagation)
    // Não deveria nem ser possível registrar um resultado de partida ainda não resolvida,
    // mas o use case não deve quebrar/propagar dado incompleto se isso ocorrer.
    await useCase.execute({ adminId: 'a', partidaId: 89, golsCasa: 1, golsFora: 0 })
    expect(repo.resolverLadosPartidas).not.toHaveBeenCalled()
  })
})
