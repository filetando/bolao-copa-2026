export interface PartidaEquipe {
  id: number
  nome: string
  sigla: string | null
  bandeiraCodigo: string | null
}

export interface PartidaListItem {
  id: number
  faseNome: string
  multiplicador: number
  dataHoraUtc: Date
  estadio: string | null
  cidade: string | null
  equipeCasa: PartidaEquipe | null
  equipeFora: PartidaEquipe | null
  placeholderCasa: string | null
  placeholderFora: string | null
  golsCasa: number | null
  golsFora: number | null
  status: string
  grupoSimultaneoId: number | null
}

export interface PartidaBasica {
  id: number
  status: string
}

export interface AtualizacaoEquipesResolvidas {
  id: number
  equipeCasaId: number | null
  equipeForaId: number | null
}

export interface PartidaRepository {
  findAllOrderedByDate(): Promise<PartidaListItem[]>
  findById(id: number): Promise<PartidaBasica | null>
  registerResult(id: number, golsCasa: number, golsFora: number): Promise<void>
  // Marco 3 (BracketGeneratorService) / Marco 4 (propagação de vencedores) — atualiza
  // equipe_casa_id/equipe_fora_id de várias partidas em UMA transação (DATABASE.md §4).
  updateEquipesResolvidas(updates: AtualizacaoEquipesResolvidas[]): Promise<void>
}
