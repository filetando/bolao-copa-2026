import { Palpite } from '../../../domain/bolao/Palpite.js'
import { MatchNotFoundError } from '../../../domain/bolao/errors.js'
import type { PalpiteRepository, PalpiteData } from '../ports/PalpiteRepository.js'
import type { TournamentReadPort } from '../ports/TournamentReadPort.js'

interface Input {
  usuarioId: string
  partidaId: number
  golsCasaPalpite: number
  golsForaPalpite: number
}

export class SubmitPrediction {
  constructor(
    private readonly palpiteRepo: PalpiteRepository,
    private readonly tournament: TournamentReadPort,
  ) {}

  async execute(input: Input): Promise<PalpiteData> {
    const partida = await this.tournament.getPartida(input.partidaId)
    if (!partida) throw new MatchNotFoundError()

    // DOMAIN_RULES.md §9 — partidas simultâneas usam o menor horário do conjunto
    const cutoff =
      partida.grupoSimultaneoId !== null
        ? await this.tournament.getMinDataHoraUtcForGrupoSimultaneo(partida.grupoSimultaneoId)
        : partida.dataHoraUtc

    // Invariante do domínio: lança PredictionLockedError se janela fechada (ADR-004)
    Palpite.create(input.usuarioId, input.partidaId, input.golsCasaPalpite, input.golsForaPalpite, cutoff)

    return this.palpiteRepo.upsert({
      usuarioId: input.usuarioId,
      partidaId: input.partidaId,
      golsCasaPalpite: input.golsCasaPalpite,
      golsForaPalpite: input.golsForaPalpite,
    })
  }
}
