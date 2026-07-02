import type { PartidaRepository, PartidaListItem } from '../ports/PartidaRepository.js'

export class ListMataMataMatches {
  constructor(private readonly partidaRepo: PartidaRepository) {}

  async execute(): Promise<PartidaListItem[]> {
    return this.partidaRepo.findMataMata()
  }
}
