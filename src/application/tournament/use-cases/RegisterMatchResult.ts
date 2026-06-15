import type { PartidaRepository } from '../ports/PartidaRepository.js'
import { MatchNotFoundError } from '../../../domain/tournament/errors.js'

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

    // Admin pode corrigir resultado de partida já encerrada — recálculo de pontos
    // é disparado em seguida pelo CalculateScoreForMatch no route handler
    await this.partidaRepo.registerResult(input.partidaId, input.golsCasa, input.golsFora)
  }
}
