import { AppError } from '../errors.js'

export class PredictionLockedError extends AppError {
  constructor() {
    super('PREDICTION_LOCKED', 'Palpite encerrado: a janela de envio para esta partida já fechou.')
  }
}

export class MatchNotFoundError extends AppError {
  constructor() {
    super('MATCH_NOT_FOUND', 'Partida não encontrada.')
  }
}

export class StaticMarketLockedError extends AppError {
  constructor() {
    // DOMAIN_RULES.md §9 — imutável após 11/06/2026 (abertura do torneio)
    super('STATIC_MARKET_LOCKED', 'Palpites estáticos encerrados: o torneio já começou.')
  }
}
