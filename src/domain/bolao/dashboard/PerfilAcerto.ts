// Dashboard item 2 — "de onde veio cada palpite": para cada usuário, % de palpites em cada
// categoria da cascata (DOMAIN_RULES.md §7). Revela o estilo do jogador (cravador vs.
// consistente vs. que erra mais), não só o total de pontos.
import { RegraPontuacao, type CategoriaPalpite } from '../RegraPontuacao.js'
import type { DetalhePalpiteRow } from './DetalhePalpiteRow.js'

export interface PerfilAcertoUsuario {
  usuarioId: string
  nome: string
  totalPalpites: number
  categorias: Record<CategoriaPalpite, { quantidade: number; percentual: number }>
}

const CATEGORIAS: CategoriaPalpite[] = [
  'placar_exato',
  'vencedor_gols',
  'vencedor_saldo',
  'empate_certo',
  'so_vencedor',
  'erro',
]

export function calcularPerfilAcerto(rows: DetalhePalpiteRow[]): PerfilAcertoUsuario[] {
  const porUsuario = new Map<string, { nome: string; rows: DetalhePalpiteRow[] }>()

  for (const row of rows) {
    if (!porUsuario.has(row.usuarioId)) porUsuario.set(row.usuarioId, { nome: row.nome, rows: [] })
    porUsuario.get(row.usuarioId)!.rows.push(row)
  }

  return [...porUsuario.entries()].map(([usuarioId, { nome, rows: rowsDoUsuario }]) => {
    const contagem: Record<CategoriaPalpite, number> = {
      placar_exato: 0,
      vencedor_gols: 0,
      vencedor_saldo: 0,
      empate_certo: 0,
      so_vencedor: 0,
      erro: 0,
    }

    for (const row of rowsDoUsuario) {
      const categoria = RegraPontuacao.classificar(
        { golsCasa: row.golsCasaPalpite, golsFora: row.golsForaPalpite },
        { golsCasa: row.golsCasa, golsFora: row.golsFora },
      )
      contagem[categoria]++
    }

    const total = rowsDoUsuario.length
    const categorias = Object.fromEntries(
      CATEGORIAS.map((categoria) => [
        categoria,
        { quantidade: contagem[categoria], percentual: total === 0 ? 0 : (contagem[categoria] / total) * 100 },
      ]),
    ) as Record<CategoriaPalpite, { quantidade: number; percentual: number }>

    return { usuarioId, nome, totalPalpites: total, categorias }
  })
}
