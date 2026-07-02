// DOMAIN_RULES.md §5–§6 — monta os 16 confrontos dos jogos 73-88 (16-avos de final) a partir
// de 1º/2º colocados de cada grupo, dos 8 terceiros classificados, e do Anexo C.
import type { ConfrontoTerceiro } from './AnexoCLookup.js'

export interface ConfrontoGerado {
  partidaId: number
  equipeCasaId: number | null
  equipeForaId: number | null
}

type LadoFixo =
  | { tipo: '1'; grupo: string }
  | { tipo: '2'; grupo: string }
  | { tipo: 'anexoC'; chave: keyof ConfrontoTerceiro }

interface ComposicaoJogo {
  casa: LadoFixo
  fora: LadoFixo
}

// bolao-copa-2026_1.md §6 — tabela oficial dos jogos 73-88. C/F/H/J sempre enfrentam 2º
// colocado (regra fixa, DOMAIN_RULES.md §5); os demais 1ºs (A/B/D/E/G/I/K/L) enfrentam o
// terceiro colocado indicado pelo Anexo C para a combinação classificada.
const COMPOSICAO_16_AVOS: Record<number, ComposicaoJogo> = {
  73: { casa: { tipo: '2', grupo: 'A' }, fora: { tipo: '2', grupo: 'B' } },
  74: { casa: { tipo: '1', grupo: 'E' }, fora: { tipo: 'anexoC', chave: 'vs1e' } },
  75: { casa: { tipo: '1', grupo: 'F' }, fora: { tipo: '2', grupo: 'C' } },
  76: { casa: { tipo: '1', grupo: 'C' }, fora: { tipo: '2', grupo: 'F' } },
  77: { casa: { tipo: '1', grupo: 'I' }, fora: { tipo: 'anexoC', chave: 'vs1i' } },
  78: { casa: { tipo: '2', grupo: 'E' }, fora: { tipo: '2', grupo: 'I' } },
  79: { casa: { tipo: '1', grupo: 'A' }, fora: { tipo: 'anexoC', chave: 'vs1a' } },
  80: { casa: { tipo: '1', grupo: 'L' }, fora: { tipo: 'anexoC', chave: 'vs1l' } },
  81: { casa: { tipo: '1', grupo: 'D' }, fora: { tipo: 'anexoC', chave: 'vs1d' } },
  82: { casa: { tipo: '1', grupo: 'G' }, fora: { tipo: 'anexoC', chave: 'vs1g' } },
  83: { casa: { tipo: '2', grupo: 'K' }, fora: { tipo: '2', grupo: 'L' } },
  84: { casa: { tipo: '1', grupo: 'H' }, fora: { tipo: '2', grupo: 'J' } },
  85: { casa: { tipo: '1', grupo: 'B' }, fora: { tipo: 'anexoC', chave: 'vs1b' } },
  86: { casa: { tipo: '1', grupo: 'J' }, fora: { tipo: '2', grupo: 'H' } },
  87: { casa: { tipo: '1', grupo: 'K' }, fora: { tipo: 'anexoC', chave: 'vs1k' } },
  88: { casa: { tipo: '2', grupo: 'D' }, fora: { tipo: '2', grupo: 'G' } },
}

export class BracketGeneratorService {
  // DOMAIN_RULES.md §5–§6 — jogos 73-88
  static gerar(
    primeirosPorGrupo: Record<string, number>,
    segundosPorGrupo: Record<string, number>,
    terceirosClassificadosPorGrupo: Record<string, number>,
    confrontoAnexoC: ConfrontoTerceiro,
  ): ConfrontoGerado[] {
    const resolverLado = (lado: LadoFixo): number | null => {
      if (lado.tipo === '1') return primeirosPorGrupo[lado.grupo] ?? null
      if (lado.tipo === '2') return segundosPorGrupo[lado.grupo] ?? null
      const grupoTerceiro = confrontoAnexoC[lado.chave]
      return terceirosClassificadosPorGrupo[grupoTerceiro] ?? null
    }

    return Object.entries(COMPOSICAO_16_AVOS).map(([partidaId, composicao]) => ({
      partidaId: Number(partidaId),
      equipeCasaId: resolverLado(composicao.casa),
      equipeForaId: resolverLado(composicao.fora),
    }))
  }
}
