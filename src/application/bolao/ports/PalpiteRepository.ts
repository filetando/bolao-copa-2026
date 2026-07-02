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

export interface PartidaResumida {
  id: number
  faseId: string
  faseNome: string
  grupoId: string | null
  dataHoraUtc: Date
  status: string
  golsCasa: number | null
  golsFora: number | null
  multiplicador: number
  equipeCasa: { id: number; nome: string; sigla: string | null; bandeiraCodigo: string | null } | null
  equipeFora: { id: number; nome: string; sigla: string | null; bandeiraCodigo: string | null } | null
  placeholderCasa: string | null
  placeholderFora: string | null
}

export interface PalpiteComPartida extends PalpiteData {
  partida: PartidaResumida
}

export interface PalpiteResumo {
  id: string
  golsCasaPalpite: number
  golsForaPalpite: number
  pontosObtidos: number | null
}

export interface PartidaComPalpiteData {
  partida: PartidaResumida
  palpite: PalpiteResumo | null
}

export interface UltimoPalpiteFinalizadoRow {
  usuarioId: string
  nomeUsuario: string
  golsCasaPalpite: number
  golsForaPalpite: number
  pontosObtidos: number | null
  partida: PartidaResumida
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
  findById(id: string): Promise<PalpiteData | null>
  findByUsuarioWithPartida(usuarioId: string): Promise<PalpiteComPartida[]>
  updateGols(id: string, golsCasaPalpite: number, golsForaPalpite: number): Promise<void>
  findAllPartidasWithPalpiteForUser(usuarioId: string): Promise<PartidaComPalpiteData[]>
  // Snapshot de auditoria (RegisterMatchResult) — para cada usuário, o palpite cuja partida
  // encerrada tem o data_hora_utc mais recente (DISTINCT ON por usuário).
  findUltimosPalpitesFinalizados(): Promise<UltimoPalpiteFinalizadoRow[]>
}
