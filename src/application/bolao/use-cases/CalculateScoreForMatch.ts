import type { TournamentReadPort } from '../ports/TournamentReadPort.js'
import type { PalpiteRepository } from '../ports/PalpiteRepository.js'
import { MatchNotFoundError } from '../../../domain/bolao/errors.js'
import { MatchNotEncerradaError } from '../../../domain/tournament/errors.js'
import { RegraPontuacao } from '../../../domain/bolao/RegraPontuacao.js'

interface Input {
  partidaId: number
}

interface Output {
  count: number
  totalPontos: number
}

export class CalculateScoreForMatch {
  constructor(
    private readonly tournament: TournamentReadPort,
    private readonly palpiteRepo: PalpiteRepository,
  ) {}

  async execute(input: Input): Promise<Output> {
    const partida = await this.tournament.getPartida(input.partidaId)
    if (!partida) throw new MatchNotFoundError()
    if (partida.status !== 'encerrada' || partida.golsCasa === null || partida.golsFora === null) {
      throw new MatchNotEncerradaError()
    }

    const resultado = { golsCasa: partida.golsCasa, golsFora: partida.golsFora }
    const palpites = await this.palpiteRepo.findByPartida(input.partidaId)

    let totalPontos = 0
    for (const palpite of palpites) {
      const pontos = RegraPontuacao.calcular(
        { golsCasa: palpite.golsCasaPalpite, golsFora: palpite.golsForaPalpite },
        resultado,
        partida.multiplicador,
      )
      await this.palpiteRepo.updatePontosObtidos(palpite.id, pontos)
      totalPontos += pontos
    }

    return { count: palpites.length, totalPontos }
  }
}
