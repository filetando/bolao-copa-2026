export interface UserPayload {
  id: string
  username: string
  nome: string
  role: string
}

export interface Equipe {
  id: number
  nome: string
  sigla: string | null
  bandeiraCodigo: string | null
}

export interface Partida {
  id: number
  faseNome: string
  multiplicador: number
  dataHoraUtc: string
  estadio: string | null
  cidade: string | null
  equipeCasa: Equipe | null
  equipeFora: Equipe | null
  placeholderCasa: string | null
  placeholderFora: string | null
  golsCasa: number | null
  golsFora: number | null
  status: string
  grupoSimultaneoId: number | null
  vencedorPenaltisEquipeId: number | null
}

export interface PalpiteData {
  id: string
  usuarioId: string
  partidaId: number
  golsCasaPalpite: number
  golsForaPalpite: number
  pontosObtidos: number | null
  createdAt: string
  updatedAt: string
}

export interface PalpiteWithUser extends PalpiteData {
  nomeUsuario: string
}

export interface PredictionsForMatch {
  visibilidadeTotal: boolean
  palpites: PalpiteWithUser[]
}

export interface LeaderboardRow {
  posicao: number
  usuarioId: string
  nome: string
  totalPontos: number
}

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

export interface ClassificacaoRow {
  posicao: number
  equipe: { id: number; nome: string; sigla: string | null; bandeiraCodigo: string | null }
  jogos: number
  vitorias: number
  empates: number
  derrotas: number
  golsMarcados: number
  golsSofridos: number
  saldoGols: number
  pontos: number
}

export interface UsuarioBasico {
  id: string
  nome: string
  username: string
}

export interface PartidaResumida {
  id: number
  faseId: string
  faseNome: string
  grupoId: string | null
  dataHoraUtc: string
  status: string
  golsCasa: number | null
  golsFora: number | null
  multiplicador: number
  equipeCasa: Equipe | null
  equipeFora: Equipe | null
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

export interface PartidaComPalpiteAdmin {
  partida: PartidaResumida
  palpite: PalpiteResumo | null
}

export interface ConfrontoGerado {
  partidaId: number
  equipeCasaId: number | null
  equipeForaId: number | null
}

export interface GenerateBracketResponse {
  confrontos: ConfrontoGerado[]
  chaveAnexoC: string
}
