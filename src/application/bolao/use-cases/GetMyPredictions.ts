import type { PalpiteRepository, PalpiteData } from '../ports/PalpiteRepository.js'

export class GetMyPredictions {
  constructor(private readonly palpiteRepo: PalpiteRepository) {}

  async execute(usuarioId: string): Promise<PalpiteData[]> {
    return this.palpiteRepo.findByUsuario(usuarioId)
  }
}
