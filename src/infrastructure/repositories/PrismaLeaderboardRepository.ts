import type { PrismaClient } from '@prisma/client'
import type { LeaderboardRepository, LeaderboardEntry } from '../../application/bolao/ports/LeaderboardRepository.js'

type RawRow = { usuario_id: string; nome: string; total_pontos: number }

export class PrismaLeaderboardRepository implements LeaderboardRepository {
  constructor(private readonly db: PrismaClient) {}

  async findRanking(): Promise<LeaderboardEntry[]> {
    // DOMAIN_RULES.md §7/§8 — totalPontos = soma de palpites.pontosObtidos (após partidas encerradas)
    const rows = await this.db.$queryRaw<RawRow[]>`
      SELECT
        u.id               AS usuario_id,
        u.nome,
        CAST(COALESCE(SUM(p.pontos_obtidos), 0) AS INTEGER) AS total_pontos
      FROM usuarios u
      LEFT JOIN palpites p ON p.usuario_id = u.id
      WHERE u.nome != 'Tester'
      GROUP BY u.id, u.nome
      ORDER BY total_pontos DESC, u.nome ASC
    `
    return rows.map((r) => ({
      usuarioId: r.usuario_id,
      nome: r.nome,
      totalPontos: r.total_pontos,
    }))
  }
}
