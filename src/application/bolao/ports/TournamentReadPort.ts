// Anti-Corruption Layer: bolao lê tournament exclusivamente por esta interface
// ARCHITECTURE.md §2.3 — bolao nunca acessa tabelas de tournament diretamente
export interface PartidaInfo {
  id: number
  dataHoraUtc: Date
  status: string
  grupoSimultaneoId: number | null
  golsCasa: number | null      // DOMAIN_RULES.md §7 — necessários para calcular pontuação
  golsFora: number | null
  multiplicador: number        // DOMAIN_RULES.md §8 — de Fase.multiplicador
}

export interface TournamentReadPort {
  getPartida(id: number): Promise<PartidaInfo | null>
  // DOMAIN_RULES.md §10 — retorna o menor dataHoraUtc do conjunto simultâneo
  getMinDataHoraUtcForGrupoSimultaneo(grupoSimultaneoId: number): Promise<Date>
}
