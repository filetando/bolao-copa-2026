// ADR-003 (DECISIONS_LOG.md) — disparo manual pelo admin em 27/06, após conferência humana
// da classificação oficial. Orquestra ClassificacaoService + TerceirosColocadosService +
// AnexoCLookup + BracketGeneratorService para popular os jogos 73-88 com times reais.
import type { GrupoRepository } from '../ports/GrupoRepository.js'
import type { PartidaRepository } from '../ports/PartidaRepository.js'
import { ClassificacaoService } from '../../../domain/tournament/ClassificacaoService.js'
import { TerceirosColocadosService, type TerceiroColocadoInput } from '../../../domain/tournament/TerceirosColocadosService.js'
import { AnexoCLookup, type ConfrontoTerceiro } from '../../../domain/tournament/AnexoCLookup.js'
import { BracketGeneratorService, type ConfrontoGerado } from '../../../domain/tournament/BracketGeneratorService.js'
import { GroupStageNotCompleteError } from '../../../domain/tournament/errors.js'

const GRUPOS = 'ABCDEFGHIJKL'.split('')
const JOGOS_POR_GRUPO = 6 // round-robin de 4 equipes (DOMAIN_RULES.md §1)

export interface Output {
  confrontos: ConfrontoGerado[]
  chaveAnexoC: string
}

export class GenerateKnockoutBracket {
  constructor(
    private readonly grupoRepo: GrupoRepository,
    private readonly partidaRepo: PartidaRepository,
    private readonly anexoCLookup: AnexoCLookup,
  ) {}

  async execute(): Promise<Output> {
    const primeirosPorGrupo: Record<string, number> = {}
    const segundosPorGrupo: Record<string, number> = {}
    const terceirosInput: TerceiroColocadoInput[] = []

    for (const grupoId of GRUPOS) {
      const grupo = await this.grupoRepo.findGrupoComPartidasEncerradas(grupoId)
      if (!grupo || grupo.partidas.length < JOGOS_POR_GRUPO) {
        throw new GroupStageNotCompleteError()
      }

      const equipes = grupo.equipes.map((e) => ({ ...e, rankingFifa: 999 }))
      const classificacao = ClassificacaoService.calcular(equipes, grupo.partidas)

      primeirosPorGrupo[grupoId] = classificacao[0].equipe.id
      segundosPorGrupo[grupoId] = classificacao[1].equipe.id

      const terceiroId = classificacao[2].equipe.id
      terceirosInput.push({
        grupoId,
        equipe: { ...classificacao[2].equipe, rankingFifa: 999 },
        partidas: grupo.partidas.filter((p) => p.equipeCasaId === terceiroId || p.equipeForaId === terceiroId),
      })
    }

    const { classificados, chaveAnexoC } = TerceirosColocadosService.rankear(terceirosInput)
    const terceirosClassificadosPorGrupo: Record<string, number> = Object.fromEntries(
      classificados.map((c) => [c.grupoId, c.equipe.id]),
    )

    const confrontoAnexoC: ConfrontoTerceiro = this.anexoCLookup.lookup(chaveAnexoC)

    const confrontos = BracketGeneratorService.gerar(
      primeirosPorGrupo,
      segundosPorGrupo,
      terceirosClassificadosPorGrupo,
      confrontoAnexoC,
    )

    await this.partidaRepo.updateEquipesResolvidas(
      confrontos.map((c) => ({ id: c.partidaId, equipeCasaId: c.equipeCasaId, equipeForaId: c.equipeForaId })),
    )

    return { confrontos, chaveAnexoC }
  }
}
