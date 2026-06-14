import type { LeaderboardRepository, LeaderboardEntry } from '../ports/LeaderboardRepository.js'

export interface LeaderboardRow extends LeaderboardEntry {
  posicao: number
}

export class GetLeaderboard {
  constructor(private readonly repo: LeaderboardRepository) {}

  async execute(): Promise<LeaderboardRow[]> {
    const entries = await this.repo.findRanking()
    return entries.map((entry, idx) => ({ posicao: idx + 1, ...entry }))
  }
}
