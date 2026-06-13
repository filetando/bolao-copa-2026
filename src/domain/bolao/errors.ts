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
