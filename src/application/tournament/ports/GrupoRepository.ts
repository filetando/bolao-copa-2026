export interface EquipeBasica {
  id: number
  nome: string
  sigla: string | null
  bandeiraCodigo: string | null
}

export interface PartidaGrupoRow {
  equipeCasaId: number
  equipeForaId: number
  golsCasa: number
  golsFora: number
}

export interface GrupoComPartidas {
  equipes: EquipeBasica[]
  partidas: PartidaGrupoRow[]
}

export interface GrupoRepository {
  findGrupoComPartidasEncerradas(grupoId: string): Promise<GrupoComPartidas | null>
}
