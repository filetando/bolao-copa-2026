import { StaticMarketLockedError } from './errors.js'
import type { MercadoEstatico } from './MercadoEstatico.js'

// DOMAIN_RULES.md §9 — travado antes de 11/06/2026 (abertura do torneio)
const STATIC_LOCK_DATE = new Date('2026-06-11T00:00:00Z')

export class PalpiteEstatico {
  readonly usuarioId: string
  readonly mercado: MercadoEstatico
  readonly valorEquipeId: number | null
  readonly valorTexto: string | null

  private constructor(props: {
    usuarioId: string
    mercado: MercadoEstatico
    valorEquipeId: number | null
    valorTexto: string | null
  }) {
    this.usuarioId = props.usuarioId
    this.mercado = props.mercado
    this.valorEquipeId = props.valorEquipeId
    this.valorTexto = props.valorTexto
  }

  static create(
    usuarioId: string,
    mercado: MercadoEstatico,
    valorEquipeId: number | null,
    valorTexto: string | null,
    now: Date = new Date(),
  ): PalpiteEstatico {
    if (now >= STATIC_LOCK_DATE) throw new StaticMarketLockedError()
    return new PalpiteEstatico({ usuarioId, mercado, valorEquipeId, valorTexto })
  }
}
