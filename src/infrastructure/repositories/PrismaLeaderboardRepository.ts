import type { PrismaClient } from '@prisma/client'
import type {
  LeaderboardRepository,
  LeaderboardEntry,
  HistoricoPontosRow,
} from '../../application/bolao/ports/LeaderboardRepository.js'
import type { DetalhePalpiteRow } from '../../domain/bolao/dashboard/DetalhePalpiteRow.js'

type RawRow = { usuario_id: string; nome: string; total_pontos: number }

type RawHistoricoRow = {
  partida_id: number
  data_hora_utc: Date
  usuario_id: string
  nome: string
  pontos_obtidos: number
  equipe_casa_sigla: string | null
  equipe_fora_sigla: string | null
}

type RawDetalhePalpiteRow = {
  usuario_id: string
  nome: string
  partida_id: number
  fase_id: string
  fase_nome_exibicao: string
  fase_ordem: number
  multiplicador: number
  gols_casa: number
  gols_fora: number
  gols_casa_palpite: number | null
  gols_fora_palpite: number | null
  pontos_obtidos: number
  data_hora_utc: Date
  equipe_casa_sigla: string | null
  equipe_fora_sigla: string | null
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
        pa.pontos_obtidos AS pontos_obtidos,
        ec.sigla        AS equipe_casa_sigla,
        ef.sigla        AS equipe_fora_sigla
      FROM palpites pa
      JOIN partidas p ON p.id = pa.partida_id
      JOIN usuarios u ON u.id = pa.usuario_id
      LEFT JOIN equipes ec ON ec.id = p.equipe_casa_id
      LEFT JOIN equipes ef ON ef.id = p.equipe_fora_id
      WHERE p.status = 'encerrada' AND pa.pontos_obtidos IS NOT NULL AND u.nome != 'Tester'
      ORDER BY p.data_hora_utc ASC, p.id ASC
    `
    return rows.map((r) => ({
      partidaId: r.partida_id,
      dataHoraUtc: r.data_hora_utc.toISOString(),
      usuarioId: r.usuario_id,
      nome: r.nome,
      pontosObtidos: r.pontos_obtidos,
      equipeCasaSigla: r.equipe_casa_sigla,
      equipeForaSigla: r.equipe_fora_sigla,
    }))
  }

  async findDetalhesPalpites(): Promise<DetalhePalpiteRow[]> {
    // Uma linha por USUÁRIO × PARTIDA ENCERRADA (cross join), não por palpite — quem não
    // apostou aparece com gols_casa_palpite/gols_fora_palpite NULL e pontos_obtidos 0, porque
    // não apostar conta como errar (DOMAIN_RULES.md). Base para perfil de acerto, pontos por
    // fase, aproveitamento, contrafactual e recordes.
    const rows = await this.db.$queryRaw<RawDetalhePalpiteRow[]>`
      SELECT
        u.id                                              AS usuario_id,
        u.nome                                            AS nome,
        p.id                                              AS partida_id,
        p.fase_id                                         AS fase_id,
        f.nome_exibicao                                   AS fase_nome_exibicao,
        f.ordem                                           AS fase_ordem,
        CAST(f.multiplicador AS DOUBLE PRECISION)         AS multiplicador,
        p.gols_casa                                       AS gols_casa,
        p.gols_fora                                       AS gols_fora,
        pa.gols_casa_palpite                              AS gols_casa_palpite,
        pa.gols_fora_palpite                              AS gols_fora_palpite,
        CAST(COALESCE(pa.pontos_obtidos, 0) AS INTEGER)   AS pontos_obtidos,
        p.data_hora_utc                                   AS data_hora_utc,
        ec.sigla                                          AS equipe_casa_sigla,
        ef.sigla                                          AS equipe_fora_sigla
      FROM usuarios u
      CROSS JOIN partidas p
      JOIN fases f ON f.id = p.fase_id
      LEFT JOIN palpites pa ON pa.partida_id = p.id AND pa.usuario_id = u.id
      LEFT JOIN equipes ec ON ec.id = p.equipe_casa_id
      LEFT JOIN equipes ef ON ef.id = p.equipe_fora_id
      WHERE p.status = 'encerrada' AND u.nome != 'Tester'
      ORDER BY p.data_hora_utc ASC, p.id ASC
    `
    return rows.map((r) => ({
      usuarioId: r.usuario_id,
      nome: r.nome,
      partidaId: r.partida_id,
      faseId: r.fase_id,
      faseNomeExibicao: r.fase_nome_exibicao,
      faseOrdem: r.fase_ordem,
      multiplicador: r.multiplicador,
      golsCasa: r.gols_casa,
      golsFora: r.gols_fora,
      golsCasaPalpite: r.gols_casa_palpite,
      golsForaPalpite: r.gols_fora_palpite,
      pontosObtidos: r.pontos_obtidos,
      dataHoraUtc: r.data_hora_utc.toISOString(),
      equipeCasaSigla: r.equipe_casa_sigla,
      equipeForaSigla: r.equipe_fora_sigla,
    }))
  }
}
