import { PredictionLockedError } from './errors.js'

// DOMAIN_RULES.md §9 — bloqueio no horário exato de início da partida
export const LOCK_WINDOW_MS = 0

export class Palpite {
  readonly usuarioId: string
  readonly partidaId: number
  readonly golsCasaPalpite: number
  readonly golsForaPalpite: number

  private constructor(props: {
    usuarioId: string
    partidaId: number
    golsCasaPalpite: number
    golsForaPalpite: number
  }) {
    this.usuarioId = props.usuarioId
    this.partidaId = props.partidaId
    this.golsCasaPalpite = props.golsCasaPalpite
    this.golsForaPalpite = props.golsForaPalpite
  }

  // DOMAIN_RULES.md §9 + ADR-004: bloqueio validado no backend
  // lockCutoff = menor dataHoraUtc do grupoSimultaneo (ou a própria partida, se não houver grupo)
  static create(
    usuarioId: string,
    partidaId: number,
    golsCasa: number,
    golsFora: number,
    lockCutoff: Date,
  ): Palpite {
    if (Date.now() >= lockCutoff.getTime() - LOCK_WINDOW_MS) {
      throw new PredictionLockedError()
    }
    return new Palpite({ usuarioId, partidaId, golsCasaPalpite: golsCasa, golsForaPalpite: golsFora })
  }
}
