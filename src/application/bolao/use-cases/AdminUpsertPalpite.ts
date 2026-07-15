import type { PalpiteRepository } from '../ports/PalpiteRepository.js'
import type { TournamentReadPort } from '../ports/TournamentReadPort.js'
import { RegraPontuacao } from '../../../domain/bolao/RegraPontuacao.js'

interface Input {
  usuarioId: string
  partidaId: number
  golsCasaPalpite: number
  golsForaPalpite: number
}

interface Output {
  palpiteId: string
  pontosObtidos: number | null
}

// Admin bypassa a janela de bloqueio — DOMAIN_RULES.md §9 aplica somente a usuários comuns
export class AdminUpsertPalpite {
  constructor(
    private readonly palpiteRepo: PalpiteRepository,
    private readonly tournament: TournamentReadPort,
  ) {}

  async execute(input: Input): Promise<Output> {
    const palpite = await this.palpiteRepo.upsert({
      usuarioId: input.usuarioId,
      partidaId: input.partidaId,
      golsCasaPalpite: input.golsCasaPalpite,
      golsForaPalpite: input.golsForaPalpite,
    })

    const partida = await this.tournament.getPartida(input.partidaId)
    let pontosObtidos: number | null = null

    if (partida && partida.status === 'encerrada' && partida.golsCasa !== null && partida.golsFora !== null) {
      pontosObtidos = RegraPontuacao.calcular(
        { golsCasa: input.golsCasaPalpite, golsFora: input.golsForaPalpite },
        { golsCasa: partida.golsCasa, golsFora: partida.golsFora },
        partida.multiplicador,
      )
      await this.palpiteRepo.updatePontosObtidos(palpite.id, pontosObtidos)
    }

    return { palpiteId: palpite.id, pontosObtidos }
  }
}
