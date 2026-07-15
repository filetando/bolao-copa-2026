import { LOCK_WINDOW_MS } from '../../../domain/bolao/Palpite.js'
import { MatchNotFoundError } from '../../../domain/bolao/errors.js'
import type { PalpiteRepository, PalpiteWithUser } from '../ports/PalpiteRepository.js'
import type { TournamentReadPort } from '../ports/TournamentReadPort.js'

interface Result {
  visibilidadeTotal: boolean
  palpites: PalpiteWithUser[]
}

export class GetPredictionsForMatch {
  constructor(
    private readonly palpiteRepo: PalpiteRepository,
    private readonly tournament: TournamentReadPort,
  ) {}

  // DOMAIN_RULES.md §9 — palpites de outros usuários só são visíveis após o bloqueio
  async execute(partidaId: number, requestingUserId: string): Promise<Result> {
    const partida = await this.tournament.getPartida(partidaId)
    if (!partida) throw new MatchNotFoundError()

    const cutoff =
      partida.grupoSimultaneoId !== null
        ? await this.tournament.getMinDataHoraUtcForGrupoSimultaneo(partida.grupoSimultaneoId)
        : partida.dataHoraUtc

    const locked = Date.now() >= cutoff.getTime() - LOCK_WINDOW_MS
    const all = await this.palpiteRepo.findByPartida(partidaId)

    if (locked) {
      return { visibilidadeTotal: true, palpites: all }
    }

    return {
      visibilidadeTotal: false,
      palpites: all.filter((p) => p.usuarioId === requestingUserId),
    }
  }
}
