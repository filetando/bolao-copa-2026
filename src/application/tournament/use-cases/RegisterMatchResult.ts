import type { PartidaRepository } from '../ports/PartidaRepository.js'
import type { BracketPropagationService } from '../../../domain/tournament/BracketPropagationService.js'
import { MatchNotFoundError, PenaltyWinnerRequiredError } from '../../../domain/tournament/errors.js'

interface Input {
  adminId: string
  partidaId: number
  golsCasa: number
  golsFora: number
  // Obrigatório apenas quando a partida é de mata-mata (fase != 'grupos') e empatou no
  // tempo normal — DOMAIN_RULES.md §6.
  vencedorPenaltisEquipeId?: number
}

interface Output {
  // true quando a partida já estava 'encerrada' antes desta chamada (admin corrigindo um
  // placar já registrado, não inserindo pela primeira vez).
  correcao: boolean
}

export class RegisterMatchResult {
  constructor(
    private readonly partidaRepo: PartidaRepository,
    private readonly bracketPropagation: BracketPropagationService,
  ) {}

  async execute(input: Input): Promise<Output> {
    const partida = await this.partidaRepo.findById(input.partidaId)
    if (!partida) throw new MatchNotFoundError()
    const correcao = partida.status === 'encerrada'

    const isMataMata = partida.faseId !== 'grupos'
    const empateTempoNormal = input.golsCasa === input.golsFora

    // Fase de grupos não tem prorrogação/pênaltis (DOMAIN_RULES.md §2) — o campo é
    // ignorado nesse caso mesmo que informado.
    const vencedorPenaltisEquipeId = isMataMata && empateTempoNormal ? input.vencedorPenaltisEquipeId : undefined

    if (isMataMata && empateTempoNormal && vencedorPenaltisEquipeId === undefined) {
      throw new PenaltyWinnerRequiredError()
    }

    // Admin pode corrigir resultado de partida já encerrada — recálculo de pontos
    // é disparado em seguida pelo CalculateScoreForMatch no route handler
    await this.partidaRepo.registerResult(input.partidaId, input.golsCasa, input.golsFora, vencedorPenaltisEquipeId)

    if (!isMataMata || partida.equipeCasaId === null || partida.equipeForaId === null) return { correcao }

    const vencedorEquipeId = empateTempoNormal
      ? vencedorPenaltisEquipeId!
      : input.golsCasa > input.golsFora
        ? partida.equipeCasaId
        : partida.equipeForaId

    const resolucoes = this.bracketPropagation.resolverProximaRodada({
      id: input.partidaId,
      equipeCasaId: partida.equipeCasaId,
      equipeForaId: partida.equipeForaId,
      vencedorEquipeId,
    })

    if (resolucoes.length > 0) {
      await this.partidaRepo.resolverLadosPartidas(resolucoes)
    }

    return { correcao }
  }
}
