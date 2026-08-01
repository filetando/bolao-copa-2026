// DOMAIN_RULES.md §7 — cascata de pontuação do bolão (fase de grupos e mata-mata)
// Pontuação final = Math.round(pts_base × multiplicador)
export type CategoriaPalpite =
  | 'placar_exato'
  | 'vencedor_gols'
  | 'vencedor_saldo'
  | 'empate_certo'
  | 'so_vencedor'
  | 'erro'

// Categoria → pontos base (DOMAIN_RULES.md §7). "vencedor_saldo" e "empate_certo" empatam em
// pontos (15) mas são categorias distintas — por isso a classificação vive separada dos pontos.
const PONTOS_BASE: Record<CategoriaPalpite, number> = {
  placar_exato: 25,
  vencedor_gols: 18,
  vencedor_saldo: 15,
  empate_certo: 15,
  so_vencedor: 10,
  erro: 0,
}

export class RegraPontuacao {
  static calcular(
    palpite: { golsCasa: number; golsFora: number },
    resultado: { golsCasa: number; golsFora: number },
    multiplicador: number,
  ): number {
    const base = PONTOS_BASE[RegraPontuacao.classificar(palpite, resultado)]
    return Math.round(base * multiplicador)
  }

  static classificar(
    p: { golsCasa: number; golsFora: number },
    r: { golsCasa: number; golsFora: number },
  ): CategoriaPalpite {
    const pEmpate = p.golsCasa === p.golsFora
    const rEmpate = r.golsCasa === r.golsFora

    // Categoria 1: placar exato
    if (p.golsCasa === r.golsCasa && p.golsFora === r.golsFora) return 'placar_exato'

    // Categoria 4: empate × empate (placares diferentes — exato já descartado acima)
    if (pEmpate && rEmpate) return 'empate_certo'

    // Para categorias 2, 3, 5: vencedor deve ser o mesmo
    if (pEmpate || rEmpate) return 'erro'
    const mesmoVencedor =
      (p.golsCasa > p.golsFora && r.golsCasa > r.golsFora) ||
      (p.golsCasa < p.golsFora && r.golsCasa < r.golsFora)
    if (!mesmoVencedor) return 'erro'

    // Determina qual lado é vencedor e qual é perdedor no resultado
    const rVencedorGols = r.golsCasa > r.golsFora ? r.golsCasa : r.golsFora
    const pVencedorGols = r.golsCasa > r.golsFora ? p.golsCasa : p.golsFora

    // Categoria 2: vencedor correto + gols do vencedor batem
    if (pVencedorGols === rVencedorGols) return 'vencedor_gols'

    // Categoria 3: vencedor correto + saldo de gols bate
    if (p.golsCasa - p.golsFora === r.golsCasa - r.golsFora) return 'vencedor_saldo'

    // Categoria 5: só vencedor correto
    return 'so_vencedor'
  }
}
