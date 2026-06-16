import type { LeaderboardRepository } from '../ports/LeaderboardRepository.js'

export interface LeaderboardHistoryPoint {
  partidaId: number
  dataHoraUtc: string
  rodada: number
  pontosPorUsuario: Record<string, number>
}

export interface LeaderboardHistoryResponse {
  usuarios: { usuarioId: string; nome: string }[]
  pontos: LeaderboardHistoryPoint[]
}

export class GetLeaderboardHistory {
  constructor(private readonly repo: LeaderboardRepository) {}

  async execute(): Promise<LeaderboardHistoryResponse> {
    const rows = await this.repo.findHistoricoPontos()

    const usuarios = new Map<string, string>()
    const partidasOrdem: { partidaId: number; dataHoraUtc: string }[] = []
    const partidaIndex = new Map<number, number>()
    const ganhosPorPartida: Record<number, Record<string, number>> = {}

    for (const row of rows) {
      usuarios.set(row.usuarioId, row.nome)

      if (!partidaIndex.has(row.partidaId)) {
        partidaIndex.set(row.partidaId, partidasOrdem.length)
        partidasOrdem.push({ partidaId: row.partidaId, dataHoraUtc: row.dataHoraUtc })
        ganhosPorPartida[row.partidaId] = {}
      }
      ganhosPorPartida[row.partidaId][row.usuarioId] = row.pontosObtidos
    }

    const usuarioIds = [...usuarios.keys()]
    const acumulado: Record<string, number> = {}
    for (const id of usuarioIds) acumulado[id] = 0

    const pontos: LeaderboardHistoryPoint[] = partidasOrdem.map((partida, idx) => {
      const ganhosDaPartida = ganhosPorPartida[partida.partidaId]
      for (const id of usuarioIds) {
        acumulado[id] += ganhosDaPartida[id] ?? 0
      }
      return {
        partidaId: partida.partidaId,
        dataHoraUtc: partida.dataHoraUtc,
        rodada: idx + 1,
        pontosPorUsuario: { ...acumulado },
      }
    })

    return {
      usuarios: usuarioIds.map((usuarioId) => ({ usuarioId, nome: usuarios.get(usuarioId)! })),
      pontos,
    }
  }
}
