import type { GrupoRepository } from '../ports/GrupoRepository.js'
import { ClassificacaoService, type LinhaClassificacao } from '../../../domain/tournament/ClassificacaoService.js'
import { AppError } from '../../../domain/errors.js'

class GroupNotFoundError extends AppError {
  constructor() {
    super('GROUP_NOT_FOUND', 'Grupo não encontrado.')
  }
}

export class GetGroupStandings {
  constructor(private readonly grupoRepo: GrupoRepository) {}

  async execute(grupoId: string): Promise<LinhaClassificacao[]> {
    const grupo = await this.grupoRepo.findGrupoComPartidasEncerradas(grupoId)
    if (!grupo) throw new GroupNotFoundError()

    // rankingFifa não está no schema atual — usar 999 como fallback para todos
    const equipes = grupo.equipes.map((e) => ({ ...e, rankingFifa: 999 }))
    return ClassificacaoService.calcular(equipes, grupo.partidas)
  }
}
