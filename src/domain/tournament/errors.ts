import { AppError } from '../errors.js'

export class MatchNotFoundError extends AppError {
  constructor() {
    super('MATCH_NOT_FOUND', 'Partida não encontrada.')
  }
}

export class InvalidCombinacaoError extends AppError {
  constructor(combinacao: string) {
    // DOMAIN_RULES.md §5 — combinação deve ser uma das 495 chaves válidas do Anexo C
    super('INVALID_COMBINACAO', `Combinação de terceiros colocados inválida: "${combinacao}".`)
  }
}

export class GroupStageNotCompleteError extends AppError {
  constructor() {
    super('GROUP_STAGE_NOT_COMPLETE', 'Ainda há partidas da fase de grupos não encerradas.')
  }
}

export class MatchAlreadyFinishedError extends AppError {
  constructor() {
    // DOMAIN_RULES.md §7 — resultado só pode ser registrado uma vez
    super('MATCH_ALREADY_FINISHED', 'Partida já encerrada.')
  }
}

export class MatchNotEncerradaError extends AppError {
  constructor() {
    super('MATCH_NOT_ENCERRADA', 'Partida ainda não encerrada.')
  }
}
