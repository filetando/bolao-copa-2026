import { AppError } from '../errors.js'

export class MatchNotFoundError extends AppError {
  constructor() {
    super('MATCH_NOT_FOUND', 'Partida não encontrada.')
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
