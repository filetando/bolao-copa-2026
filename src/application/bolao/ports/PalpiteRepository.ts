export interface PalpiteData {
  id: string
  usuarioId: string
  partidaId: number
  golsCasaPalpite: number
  golsForaPalpite: number
  pontosObtidos: number | null
  createdAt: Date
  updatedAt: Date
}

export interface PalpiteWithUser extends PalpiteData {
  nomeUsuario: string
}

export interface PalpiteRepository {
  upsert(data: {
    usuarioId: string
    partidaId: number
    golsCasaPalpite: number
    golsForaPalpite: number
  }): Promise<PalpiteData>
  findByUsuario(usuarioId: string): Promise<PalpiteData[]>
  findByPartida(partidaId: number): Promise<PalpiteWithUser[]>
  updatePontosObtidos(id: string, pontos: number): Promise<void>
}
