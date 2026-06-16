import type { PrismaClient } from '@prisma/client'
import type {
  LeaderboardRepository,
  LeaderboardEntry,
  HistoricoPontosRow,
} from '../../application/bolao/ports/LeaderboardRepository.js'

type RawRow = { usuario_id: string; nome: string; total_pontos: number }

type RawHistoricoRow = {
  partida_id: number
  data_hora_utc: Date
  usuario_id: string
  nome: string
  pontos_obtidos: number
}

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

  async findHistoricoPontos(): Promise<HistoricoPontosRow[]> {
    // DOMAIN_RULES.md §7/§8 — pontos só existem após partida `encerrada`; histórico segue a ordem cronológica de data_hora_utc
    const rows = await this.db.$queryRaw<RawHistoricoRow[]>`
      SELECT
        p.id            AS partida_id,
        p.data_hora_utc AS data_hora_utc,
        u.id            AS usuario_id,
        u.nome          AS nome,
        pa.pontos_obtidos AS pontos_obtidos
      FROM palpites pa
      JOIN partidas p ON p.id = pa.partida_id
      JOIN usuarios u ON u.id = pa.usuario_id
      WHERE p.status = 'encerrada' AND pa.pontos_obtidos IS NOT NULL AND u.nome != 'Tester'
      ORDER BY p.data_hora_utc ASC, p.id ASC
    `
    return rows.map((r) => ({
      partidaId: r.partida_id,
      dataHoraUtc: r.data_hora_utc.toISOString(),
      usuarioId: r.usuario_id,
      nome: r.nome,
      pontosObtidos: r.pontos_obtidos,
    }))
  }
}
