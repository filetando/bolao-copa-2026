import type { DetalhePalpiteRow } from '../../../domain/bolao/dashboard/DetalhePalpiteRow.js'

export interface LeaderboardEntry {
  usuarioId: string
  nome: string
  totalPontos: number
}

export interface HistoricoPontosRow {
  partidaId: number
  dataHoraUtc: string
  usuarioId: string
  nome: string
  pontosObtidos: number
  equipeCasaSigla: string | null
  equipeForaSigla: string | null
  faseId: string
}

export type { DetalhePalpiteRow }

export interface LeaderboardRepository {
  findRanking(): Promise<LeaderboardEntry[]>
  findHistoricoPontos(): Promise<HistoricoPontosRow[]>
  findDetalhesPalpites(): Promise<DetalhePalpiteRow[]>
}
