import { describe, expect, it, vi } from 'vitest'
import { GenerateKnockoutBracket } from '../use-cases/GenerateKnockoutBracket.js'
import { GroupStageNotCompleteError, InvalidCombinacaoError } from '../../../domain/tournament/errors.js'
import { AnexoCLookup } from '../../../domain/tournament/AnexoCLookup.js'
import type { GrupoRepository, GrupoComPartidas } from '../ports/GrupoRepository.js'
import type { PartidaRepository } from '../ports/PartidaRepository.js'

const GRUPOS = 'ABCDEFGHIJKL'.split('')

// IDs: grupo A = 1-4, grupo B = 5-8, ..., grupo L = 45-48
function baseId(grupoId: string): number {
  return GRUPOS.indexOf(grupoId) * 4
}

// 1º sempre 9pts, 2º sempre 6pts, 3º sempre 3pts, 4º sempre 0pts (ordem inequívoca dentro do
// grupo). A margem do jogo 1º x 3º varia por `indiceGrupo` só para dar a cada 3º colocado um
// saldo de gols geral diferente e determinístico (evita empate entre os 12 terceiros e
// qualquer dependência de tie-break por nome/ranking FIFA no teste).
function makeGrupoCompleto(grupoId: string, indiceGrupo: number): GrupoComPartidas {
  const b = baseId(grupoId)
  const [p1, p2, p3, p4] = [b + 1, b + 2, b + 3, b + 4]
  return {
    equipes: [p1, p2, p3, p4].map((id) => ({ id, nome: `Equipe${id}`, sigla: `E${id}`, bandeiraCodigo: null })),
    partidas: [
      { equipeCasaId: p1, equipeForaId: p2, golsCasa: 3, golsFora: 0 },
      { equipeCasaId: p1, equipeForaId: p3, golsCasa: 2 + indiceGrupo, golsFora: 0 },
      { equipeCasaId: p1, equipeForaId: p4, golsCasa: 3, golsFora: 0 },
      { equipeCasaId: p2, equipeForaId: p3, golsCasa: 2, golsFora: 0 },
      { equipeCasaId: p2, equipeForaId: p4, golsCasa: 2, golsFora: 0 },
      { equipeCasaId: p3, equipeForaId: p4, golsCasa: 1, golsFora: 0 },
    ],
  }
}
// Saldo geral do 3º colocado = 1 - (2+indiceGrupo) - 2 = -3-indiceGrupo → decrescente com o
// índice do grupo. Os 8 primeiros grupos (A..H, índice 0..7) têm o melhor saldo → são os
// classificados esperados; I/J/K/L (índice 8..11) são eliminados.

function makeGrupoRepo(gruposIncompletos: string[] = []): GrupoRepository {
  return {
    findGrupoComPartidasEncerradas: vi.fn(async (grupoId: string) => {
      const indice = GRUPOS.indexOf(grupoId)
      if (gruposIncompletos.includes(grupoId)) {
        return { ...makeGrupoCompleto(grupoId, indice), partidas: [] }
      }
      return makeGrupoCompleto(grupoId, indice)
    }),
  }
}

function makePartidaRepo(): PartidaRepository {
  return {
    findAllOrderedByDate: vi.fn(),
    findMataMata: vi.fn(),
    findById: vi.fn(),
    registerResult: vi.fn(),
    updateEquipesResolvidas: vi.fn().mockResolvedValue(undefined),
    resolverLadosPartidas: vi.fn().mockResolvedValue(undefined),
  }
}

// Combinação esperada para este fixture: A,B,C,D,E,F,G,H classificados → chave "ABCDEFGH".
// Tabela fictícia (não é o Anexo C real — só valida que a orquestração usa a chave e o
// resultado do lookup corretamente; a correção do Anexo C real é validada em
// AnexoCLookup.test.ts e BracketGeneratorService.test.ts com dados reais).
const CHAVE_ESPERADA = 'ABCDEFGH'
function makeAnexoCLookup(): AnexoCLookup {
  return new AnexoCLookup({
    [CHAVE_ESPERADA]: { vs1a: 'C', vs1b: 'D', vs1d: 'E', vs1e: 'F', vs1g: 'H', vs1i: 'A', vs1k: 'B', vs1l: 'G' },
  })
}

describe('GenerateKnockoutBracket', () => {
  it('gera os 16 confrontos e persiste via updateEquipesResolvidas', async () => {
    const grupoRepo = makeGrupoRepo()
    const partidaRepo = makePartidaRepo()
    const anexoCLookup = makeAnexoCLookup()

    const useCase = new GenerateKnockoutBracket(grupoRepo, partidaRepo, anexoCLookup)
    const result = await useCase.execute()

    expect(result.chaveAnexoC).toBe(CHAVE_ESPERADA)
    expect(result.confrontos).toHaveLength(16)
    expect(partidaRepo.updateEquipesResolvidas).toHaveBeenCalledWith(
      result.confrontos.map((c) => ({ id: c.partidaId, equipeCasaId: c.equipeCasaId, equipeForaId: c.equipeForaId })),
    )

    // Jogos fixos que não dependem do Anexo C — 2ºA x 2ºB
    const jogo73 = result.confrontos.find((c) => c.partidaId === 73)!
    expect(jogo73.equipeCasaId).toBe(baseId('A') + 2)
    expect(jogo73.equipeForaId).toBe(baseId('B') + 2)

    // Jogo fixo C/F/H/J x 2º colocado — 1ºF x 2ºC
    const jogo75 = result.confrontos.find((c) => c.partidaId === 75)!
    expect(jogo75.equipeCasaId).toBe(baseId('F') + 1)
    expect(jogo75.equipeForaId).toBe(baseId('C') + 2)

    // Jogo via Anexo C — 1ºE x melhor 3º (vs1e = "F" na tabela fictícia acima)
    const jogo74 = result.confrontos.find((c) => c.partidaId === 74)!
    expect(jogo74.equipeCasaId).toBe(baseId('E') + 1)
    expect(jogo74.equipeForaId).toBe(baseId('F') + 3)
  })

  it('lança GroupStageNotCompleteError se algum grupo não tem os 6 jogos encerrados', async () => {
    const grupoRepo = makeGrupoRepo(['G'])
    const partidaRepo = makePartidaRepo()
    const anexoCLookup = makeAnexoCLookup()

    const useCase = new GenerateKnockoutBracket(grupoRepo, partidaRepo, anexoCLookup)

    await expect(useCase.execute()).rejects.toThrow(GroupStageNotCompleteError)
    expect(partidaRepo.updateEquipesResolvidas).not.toHaveBeenCalled()
  })

  it('propaga InvalidCombinacaoError se a combinação de terceiros não existir na tabela', async () => {
    const grupoRepo = makeGrupoRepo()
    const partidaRepo = makePartidaRepo()
    const anexoCLookup = new AnexoCLookup({}) // tabela vazia — qualquer combinação é inválida

    const useCase = new GenerateKnockoutBracket(grupoRepo, partidaRepo, anexoCLookup)

    await expect(useCase.execute()).rejects.toThrow(InvalidCombinacaoError)
    expect(partidaRepo.updateEquipesResolvidas).not.toHaveBeenCalled()
  })
})
