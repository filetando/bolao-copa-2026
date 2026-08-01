// Paleta fixa por jogador — cada um sempre a mesma cor em todos os gráficos do dashboard.
// Recharts exige valores de cor em JS, não dá pra usar utilitários do Tailwind aqui.
const CORES_POR_NOME: Record<string, string> = {
  'Lucas Fileto': '#e6592a',
  'João Gabriel': '#7a3fb0',
  'Felipe Toth': '#1baf7a',
}

const CORES_FALLBACK = ['#e0480e', '#6d28d9', '#0ea5a5', '#15803d', '#d99412', '#dc2626']

export function corDoJogador(nome: string, indiceFallback: number): string {
  return CORES_POR_NOME[nome] ?? CORES_FALLBACK[indiceFallback % CORES_FALLBACK.length]
}
