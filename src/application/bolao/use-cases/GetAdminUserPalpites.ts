import type { PalpiteRepository, PalpiteComPartida } from '../ports/PalpiteRepository.js'

export class GetAdminUserPalpites {
  constructor(private readonly palpiteRepo: PalpiteRepository) {}

  async execute(usuarioId: string): Promise<PalpiteComPartida[]> {
    return this.palpiteRepo.findByUsuarioWithPartida(usuarioId)
  }
}
