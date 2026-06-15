import type { PartidaRepository } from '../ports/PartidaRepository.js'
import { MatchNotFoundError, MatchAlreadyFinishedError } from '../../../domain/tournament/errors.js'

interface Input {
  adminId: string
  partidaId: number
  golsCasa: number
  golsFora: number
}

export class RegisterMatchResult {
  constructor(private readonly partidaRepo: PartidaRepository) {}

  async execute(input: Input): Promise<void> {
    const partida = await this.partidaRepo.findById(input.partidaId)
    if (!partida) throw new MatchNotFoundError()
    if (partida.status === 'encerrada') throw new MatchAlreadyFinishedError()

    await this.partidaRepo.registerResult(input.partidaId, input.golsCasa, input.golsFora)
  }
}
