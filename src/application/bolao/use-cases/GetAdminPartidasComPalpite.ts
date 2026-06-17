import type { PalpiteRepository, PartidaComPalpiteData } from '../ports/PalpiteRepository.js'

export class GetAdminPartidasComPalpite {
  constructor(private readonly palpiteRepo: PalpiteRepository) {}

  async execute(usuarioId: string): Promise<PartidaComPalpiteData[]> {
    return this.palpiteRepo.findAllPartidasWithPalpiteForUser(usuarioId)
  }
}
