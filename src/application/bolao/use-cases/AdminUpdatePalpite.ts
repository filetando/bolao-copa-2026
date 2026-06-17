import type { PalpiteRepository } from '../ports/PalpiteRepository.js'
import type { TournamentReadPort } from '../ports/TournamentReadPort.js'
import { RegraPontuacao } from '../../../domain/bolao/RegraPontuacao.js'
import { MatchNotFoundError } from '../../../domain/bolao/errors.js'

interface Input {
  palpiteId: string
  golsCasaPalpite: number
  golsForaPalpite: number
}

interface Output {
  palpiteId: string
  pontosObtidos: number | null
}

export class AdminUpdatePalpite {
  constructor(
    private readonly palpiteRepo: PalpiteRepository,
    private readonly tournament: TournamentReadPort,
  ) {}

  async execute(input: Input): Promise<Output> {
    const palpite = await this.palpiteRepo.findById(input.palpiteId)
    if (!palpite) throw new MatchNotFoundError()

    await this.palpiteRepo.updateGols(input.palpiteId, input.golsCasaPalpite, input.golsForaPalpite)

    const partida = await this.tournament.getPartida(palpite.partidaId)
    let pontosObtidos: number | null = null

    if (partida && partida.status === 'encerrada' && partida.golsCasa !== null && partida.golsFora !== null) {
      pontosObtidos = RegraPontuacao.calcular(
        { golsCasa: input.golsCasaPalpite, golsFora: input.golsForaPalpite },
        { golsCasa: partida.golsCasa, golsFora: partida.golsFora },
        partida.multiplicador,
      )
      await this.palpiteRepo.updatePontosObtidos(input.palpiteId, pontosObtidos)
    }

    return { palpiteId: input.palpiteId, pontosObtidos }
  }
}
