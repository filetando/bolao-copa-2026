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

export type MercadoEstatico = 'campeao' | 'vice' | 'terceiro_lugar' | 'artilheiro'

export interface PalpiteEstaticoData {
  id: string
  usuarioId: string
  mercado: MercadoEstatico
  valorEquipeId: number | null
  valorTexto: string | null
  pontosObtidos: number | null
}
