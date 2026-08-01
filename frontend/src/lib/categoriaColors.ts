import type { CategoriaPerfil } from '../types/index.ts'

// Rampa ordinal do "perfil de acerto" (roxo escuro → laranja claro), do acerto mais preciso ao
// mais fraco. Validada com a skill dataviz (scripts/validate_palette.js --ordinal): lightness
// monotônica, gaps ≥0.06 OKLCH-L, contraste do fim claro ok. Só o check de "hue único" fica
// reprovado por design — a dupla roxo/laranja é a identidade de marca do projeto
// (DESIGN_SYSTEM.md, --accent roxo + --primary laranja), pedida explicitamente pelo usuário.
// "nao_palpitou" fica fora da rampa (não é uma qualidade de acerto, é ausência de aposta) —
// vazado com contorno tracejado, bem mais discreto que o cinza sólido do "erro".
export const COR_CATEGORIA: Record<CategoriaPerfil, string> = {
  placar_exato: '#3D1A5B',
  vencedor_gols: '#5B21A6',
  vencedor_saldo: '#9C4A94',
  empate_certo: '#D97A2E',
  so_vencedor: '#EDA34A',
  erro: '#9C94A3', // cinza — "vazado": renderizado com fill translúcido + contorno visível
  nao_palpitou: '#6B7280', // cinza-azulado distinto do "erro" — precisa de cor própria pra
  // aparecer na legenda/tooltip (o swatch usa o fill "cheio", não a fillOpacity do gráfico)
}

export const ROTULO_CATEGORIA: Record<CategoriaPerfil, string> = {
  placar_exato: 'Placar exato',
  vencedor_gols: 'Vencedor + gols',
  vencedor_saldo: 'Vencedor + saldo',
  empate_certo: 'Empate certo',
  so_vencedor: 'Só vencedor',
  erro: 'Errou',
  nao_palpitou: 'Não palpitou',
}

export const ORDEM_CATEGORIAS: CategoriaPerfil[] = [
  'placar_exato',
  'vencedor_gols',
  'vencedor_saldo',
  'empate_certo',
  'so_vencedor',
  'erro',
  'nao_palpitou',
]
