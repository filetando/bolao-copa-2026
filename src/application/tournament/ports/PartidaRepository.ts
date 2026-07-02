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
  faseId: string
  equipeCasaId: number | null
  equipeForaId: number | null
  status: string
}

export interface AtualizacaoEquipesResolvidas {
  id: number
  equipeCasaId: number | null
  equipeForaId: number | null
}

export interface ResolucaoLadoPartida {
  partidaId: number
  lado: 'casa' | 'fora'
  equipeId: number
}

export interface PartidaRepository {
  findAllOrderedByDate(): Promise<PartidaListItem[]>
  findMataMata(): Promise<PartidaListItem[]>
  findById(id: number): Promise<PartidaBasica | null>
  registerResult(id: number, golsCasa: number, golsFora: number, vencedorPenaltisEquipeId?: number): Promise<void>
  // Marco 3 (BracketGeneratorService) — atualiza equipe_casa_id/equipe_fora_id de várias
  // partidas (ambos os lados conhecidos de uma vez) em UMA transação (DATABASE.md §4).
  updateEquipesResolvidas(updates: AtualizacaoEquipesResolvidas[]): Promise<void>
  // Marco 4 (BracketPropagationService) — atualiza apenas UM lado (casa OU fora) de cada
  // partida, preservando o outro lado (que pode já estar resolvido ou ainda pendente).
  resolverLadosPartidas(resolucoes: ResolucaoLadoPartida[]): Promise<void>
}
