export interface LeaderboardEntry {
  usuarioId: string
  nome: string
  totalPontos: number
}

export interface LeaderboardRepository {
  findRanking(): Promise<LeaderboardEntry[]>
}
