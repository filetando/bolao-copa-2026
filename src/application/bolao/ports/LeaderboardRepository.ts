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
}

export interface LeaderboardRepository {
  findRanking(): Promise<LeaderboardEntry[]>
  findHistoricoPontos(): Promise<HistoricoPontosRow[]>
}
