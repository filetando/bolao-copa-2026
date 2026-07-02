import type { LeaderboardRepository } from '../ports/LeaderboardRepository.js'
import type { PalpiteRepository } from '../ports/PalpiteRepository.js'
import type { SnapshotWriter } from '../ports/SnapshotWriter.js'
import { buildSnapshotMarkdown } from '../snapshot/buildSnapshotMarkdown.js'

interface Input {
  partidaId: number
  motivo: 'insercao' | 'correcao'
}

interface Output {
  path: string
}

function toFilename(contexto: Input, geradoEm: Date): string {
  const timestamp = geradoEm.toISOString().replace(/[:.]/g, '-')
  return `${timestamp}_partida-${contexto.partidaId}_${contexto.motivo}.md`
}

// Disparado a cada inserção/correção de placar (RegisterMatchResult) — DOMAIN_RULES.md não
// exige isso, é um requisito de auditoria: registra o estado da classificação e o último
// palpite finalizado de cada usuário naquele momento, para consulta em caso de disputa.
export class SaveStandingsSnapshot {
  constructor(
    private readonly leaderboardRepo: LeaderboardRepository,
    private readonly palpiteRepo: PalpiteRepository,
    private readonly snapshotWriter: SnapshotWriter,
    private readonly clock: () => Date = () => new Date(),
  ) {}

  async execute(input: Input): Promise<Output> {
    const geradoEm = this.clock()
    const [ranking, ultimosPalpites] = await Promise.all([
      this.leaderboardRepo.findRanking(),
      this.palpiteRepo.findUltimosPalpitesFinalizados(),
    ])

    const rankingComPosicao = ranking.map((entry, idx) => ({ posicao: idx + 1, ...entry }))
    const markdown = buildSnapshotMarkdown(rankingComPosicao, ultimosPalpites, {
      partidaId: input.partidaId,
      motivo: input.motivo,
      geradoEm,
    })

    const path = await this.snapshotWriter.save(toFilename(input, geradoEm), markdown)
    return { path }
  }
}
