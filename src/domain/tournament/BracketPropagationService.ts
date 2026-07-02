export interface DependenciaLado {
  tipo: 'vencedor' | 'perdedor'
  jogo: number
}

export interface DependenciaJogo {
  casa: DependenciaLado
  fora: DependenciaLado
}

export interface PartidaMataMataEncerrada {
  id: number
  equipeCasaId: number
  equipeForaId: number
  vencedorEquipeId: number
}

export interface ResolucaoPropagacao {
  partidaId: number
  lado: 'casa' | 'fora'
  equipeId: number
}

// DOMAIN_RULES.md §6 — generaliza "Venc./Perd. Jogo X" para os jogos 89–104. Um jogo
// encerrado pode alimentar mais de uma partida seguinte (ex.: semifinal alimenta tanto
// a decisão de 3º lugar quanto a final), por isso o retorno é sempre uma lista.
export class BracketPropagationService {
  constructor(private readonly dependencias: Record<string, DependenciaJogo>) {}

  resolverProximaRodada(partidaEncerrada: PartidaMataMataEncerrada): ResolucaoPropagacao[] {
    const perdedorEquipeId =
      partidaEncerrada.vencedorEquipeId === partidaEncerrada.equipeCasaId
        ? partidaEncerrada.equipeForaId
        : partidaEncerrada.equipeCasaId

    const resolucoes: ResolucaoPropagacao[] = []

    for (const [partidaIdStr, dependencia] of Object.entries(this.dependencias)) {
      for (const lado of ['casa', 'fora'] as const) {
        const dependenciaLado = dependencia[lado]
        if (dependenciaLado.jogo !== partidaEncerrada.id) continue

        const equipeId =
          dependenciaLado.tipo === 'vencedor' ? partidaEncerrada.vencedorEquipeId : perdedorEquipeId

        resolucoes.push({ partidaId: Number(partidaIdStr), lado, equipeId })
      }
    }

    return resolucoes
  }
}
