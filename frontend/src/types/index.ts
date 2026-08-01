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

export type CategoriaPalpite =
  | 'placar_exato'
  | 'vencedor_gols'
  | 'vencedor_saldo'
  | 'empate_certo'
  | 'so_vencedor'
  | 'erro'

export interface PerfilAcertoUsuario {
  usuarioId: string
  nome: string
  totalPalpites: number
  categorias: Record<CategoriaPalpite, { quantidade: number; percentual: number }>
}

export interface PontosPorFaseUsuario {
  usuarioId: string
  nome: string
  fases: { faseId: string; faseNomeExibicao: string; faseOrdem: number; pontos: number }[]
}

export interface AproveitamentoFase {
  faseId: string
  faseNomeExibicao: string
  faseOrdem: number
  maxPossivel: number
  usuarios: { usuarioId: string; nome: string; pontos: number; aproveitamento: number }[]
}

export interface ContrafactualUsuario {
  usuarioId: string
  nome: string
  pontosReais: number
  pontosSemMultiplicador: number
}

export interface RecordePorUsuario {
  usuarioId: string
  nome: string
  quantidade: number
}

export interface RecordeRodadaMaisPontuada {
  rotulo: string
  totalPontos: number
}

export interface RecordeJogoQueTodosErraram {
  partidaId: number
  faseNomeExibicao: string
  multiplicador: number
  totalDeJogosAssim: number
}

export interface Recordes {
  maisPlacaresExatos: RecordePorUsuario[]
  maiorSequenciaDeAcertos: RecordePorUsuario[]
  rodadaMaisPontuada: RecordeRodadaMaisPontuada | null
  jogoQueTodosErraram: RecordeJogoQueTodosErraram | null
}

export interface DashboardEstatisticas {
  perfilAcerto: PerfilAcertoUsuario[]
  pontosPorFase: PontosPorFaseUsuario[]
  aproveitamentoPorFase: AproveitamentoFase[]
  contrafactual: ContrafactualUsuario[]
  recordes: Recordes
}
