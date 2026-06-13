import { PalpiteEstatico } from '../../../domain/bolao/PalpiteEstatico.js'
import type { MercadoEstatico } from '../../../domain/bolao/MercadoEstatico.js'
import type { PalpiteEstaticoRepository, PalpiteEstaticoData } from '../ports/PalpiteEstaticoRepository.js'

interface Input {
  usuarioId: string
  mercado: MercadoEstatico
  valorEquipeId: number | null
  valorTexto: string | null
}

export class SubmitStaticMarketPrediction {
  constructor(private readonly repo: PalpiteEstaticoRepository) {}

  async execute(input: Input): Promise<PalpiteEstaticoData> {
    PalpiteEstatico.create(input.usuarioId, input.mercado, input.valorEquipeId, input.valorTexto)
    return this.repo.upsert({
      usuarioId: input.usuarioId,
      mercado: input.mercado,
      valorEquipeId: input.valorEquipeId,
      valorTexto: input.valorTexto,
    })
  }
}
