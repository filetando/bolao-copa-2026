import type { CategoriaPalpite } from '../types/index.ts'

// Rampa ordinal do "perfil de acerto" (roxo escuro → laranja claro), do acerto mais preciso ao
// mais fraco. Validada com a skill dataviz (scripts/validate_palette.js --ordinal): lightness
// monotônica, gaps ≥0.06 OKLCH-L, contraste do fim claro ok. Só o check de "hue único" fica
// reprovado por design — a dupla roxo/laranja é a identidade de marca do projeto
// (DESIGN_SYSTEM.md, --accent roxo + --primary laranja), pedida explicitamente pelo usuário.
export const COR_CATEGORIA: Record<CategoriaPalpite, string> = {
  placar_exato: '#3D1A5B',
  vencedor_gols: '#5B21A6',
  vencedor_saldo: '#9C4A94',
  empate_certo: '#D97A2E',
  so_vencedor: '#EDA34A',
  erro: '#9C94A3', // cinza — "vazado": renderizado com fill translúcido + contorno visível
}

export const ROTULO_CATEGORIA: Record<CategoriaPalpite, string> = {
  placar_exato: 'Placar exato',
  vencedor_gols: 'Vencedor + gols',
  vencedor_saldo: 'Vencedor + saldo',
  empate_certo: 'Empate certo',
  so_vencedor: 'Só vencedor',
  erro: 'Errou',
}

export const ORDEM_CATEGORIAS: CategoriaPalpite[] = [
  'placar_exato',
  'vencedor_gols',
  'vencedor_saldo',
  'empate_certo',
  'so_vencedor',
  'erro',
]
