import type { PartidaRepository, PartidaListItem } from '../ports/PartidaRepository.js'

export class ListMatches {
  constructor(private readonly partidaRepo: PartidaRepository) {}

  async execute(): Promise<PartidaListItem[]> {
    return this.partidaRepo.findAllOrderedByDate()
  }
}
