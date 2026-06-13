import type { PalpiteEstaticoRepository, PalpiteEstaticoData } from '../ports/PalpiteEstaticoRepository.js'

export class GetMyStaticPredictions {
  constructor(private readonly repo: PalpiteEstaticoRepository) {}

  async execute(usuarioId: string): Promise<PalpiteEstaticoData[]> {
    return this.repo.findByUsuario(usuarioId)
  }
}
