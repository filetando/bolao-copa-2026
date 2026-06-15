// DOMAIN_RULES.md §7 — cascata de pontuação do bolão (fase de grupos e mata-mata)
// Pontuação final = Math.round(pts_base × multiplicador)
export class RegraPontuacao {
  static calcular(
    palpite: { golsCasa: number; golsFora: number },
    resultado: { golsCasa: number; golsFora: number },
    multiplicador: number,
  ): number {
    const base = RegraPontuacao.calcularBase(palpite, resultado)
    return Math.round(base * multiplicador)
  }

  private static calcularBase(
    p: { golsCasa: number; golsFora: number },
    r: { golsCasa: number; golsFora: number },
  ): number {
    const pEmpate = p.golsCasa === p.golsFora
    const rEmpate = r.golsCasa === r.golsFora

    // Categoria 1: placar exato
    if (p.golsCasa === r.golsCasa && p.golsFora === r.golsFora) return 25

    // Categoria 4: empate × empate (placares diferentes — exato já descartado acima)
    if (pEmpate && rEmpate) return 15

    // Para categorias 2, 3, 5: vencedor deve ser o mesmo
    if (pEmpate || rEmpate) return 0
    const mesmoVencedor =
      (p.golsCasa > p.golsFora && r.golsCasa > r.golsFora) ||
      (p.golsCasa < p.golsFora && r.golsCasa < r.golsFora)
    if (!mesmoVencedor) return 0

    // Determina qual lado é vencedor e qual é perdedor no resultado
    const rVencedorGols = r.golsCasa > r.golsFora ? r.golsCasa : r.golsFora
    const pVencedorGols = r.golsCasa > r.golsFora ? p.golsCasa : p.golsFora

    // Categoria 2: vencedor correto + gols do vencedor batem
    if (pVencedorGols === rVencedorGols) return 18

    // Categoria 3: vencedor correto + saldo de gols bate
    if (p.golsCasa - p.golsFora === r.golsCasa - r.golsFora) return 15

    // Categoria 5: só vencedor correto
    return 10
  }
}
