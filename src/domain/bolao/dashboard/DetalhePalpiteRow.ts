// Formato canônico de uma linha "palpite de partida encerrada" consumido pelas funções puras
// do dashboard (PerfilAcerto, PontosPorFase, AproveitamentoPorFase, Contrafactual, Recordes).
// Fica em domain porque é o dado de entrada de regras de negócio — a application (port
// LeaderboardRepository) importa este tipo, não o contrário (Dependency Rule).
export interface DetalhePalpiteRow {
  usuarioId: string
  nome: string
  partidaId: number
  faseId: string
  faseNomeExibicao: string
  faseOrdem: number
  multiplicador: number
  golsCasa: number
  golsFora: number
  // null = usuário não fez palpite pra essa partida — DOMAIN_RULES.md: não apostar conta
  // como errar (0 pontos). Ver classificarComAusencia.ts.
  golsCasaPalpite: number | null
  golsForaPalpite: number | null
  pontosObtidos: number
  dataHoraUtc: string
  equipeCasaSigla: string | null
  equipeForaSigla: string | null
}
