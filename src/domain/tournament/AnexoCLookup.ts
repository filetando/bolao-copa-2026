// DOMAIN_RULES.md §5 — Anexo C: alocação dos 8 terceiros colocados classificados no
// chaveamento. Dicionário de domínio puro — a tabela de 495 combinações é injetada no
// construtor (carregada de docs/architecture/confrontos_terceiros.json pela infrastructure,
// já que `domain` não pode fazer I/O de arquivo, ver ARCHITECTURE.md §1).
import { InvalidCombinacaoError } from './errors.js'

export interface ConfrontoTerceiro {
  vs1a: string
  vs1b: string
  vs1d: string
  vs1e: string
  vs1g: string
  vs1i: string
  vs1k: string
  vs1l: string
}

export class AnexoCLookup {
  constructor(private readonly tabela: Record<string, ConfrontoTerceiro>) {}

  // DOMAIN_RULES.md §5 — combinacao: 8 letras de grupo ordenadas alfabeticamente (ex: "BDEFIJKL")
  lookup(combinacao: string): ConfrontoTerceiro {
    const confronto = this.tabela[combinacao]
    if (!confronto) throw new InvalidCombinacaoError(combinacao)
    return confronto
  }
}
