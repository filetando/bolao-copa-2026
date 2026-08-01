// Dashboard item 2 — "de onde veio cada palpite": para cada usuário, % de palpites em cada
// categoria da cascata (DOMAIN_RULES.md §7). Revela o estilo do jogador (cravador vs.
// consistente vs. que erra mais), não só o total de pontos.
//
// Diferente de Contrafactual/Recordes (que usam classificarComAusencia — não apostar conta
// como "erro" pra fins de pontuação/sequência), aqui não apostar ganha sua PRÓPRIA categoria
// ("nao_palpitou"), separada de "errou o palpite": pedido explícito do dono do bolão pra
// distinguir "apostou e errou" de "nem apostou".
import { RegraPontuacao, type CategoriaPalpite } from '../RegraPontuacao.js'
import type { DetalhePalpiteRow } from './DetalhePalpiteRow.js'

export type CategoriaPerfil = CategoriaPalpite | 'nao_palpitou'

export interface PerfilAcertoUsuario {
  usuarioId: string
  nome: string
  totalPalpites: number
  categorias: Record<CategoriaPerfil, { quantidade: number; percentual: number }>
}

const CATEGORIAS: CategoriaPerfil[] = [
  'placar_exato',
  'vencedor_gols',
  'vencedor_saldo',
  'empate_certo',
  'so_vencedor',
  'erro',
  'nao_palpitou',
]

function classificarParaPerfil(row: DetalhePalpiteRow): CategoriaPerfil {
  if (row.golsCasaPalpite === null || row.golsForaPalpite === null) return 'nao_palpitou'

  return RegraPontuacao.classificar(
    { golsCasa: row.golsCasaPalpite, golsFora: row.golsForaPalpite },
    { golsCasa: row.golsCasa, golsFora: row.golsFora },
  )
}

export function calcularPerfilAcerto(rows: DetalhePalpiteRow[]): PerfilAcertoUsuario[] {
  const porUsuario = new Map<string, { nome: string; rows: DetalhePalpiteRow[] }>()

  for (const row of rows) {
    if (!porUsuario.has(row.usuarioId)) porUsuario.set(row.usuarioId, { nome: row.nome, rows: [] })
    porUsuario.get(row.usuarioId)!.rows.push(row)
  }

  return [...porUsuario.entries()].map(([usuarioId, { nome, rows: rowsDoUsuario }]) => {
    const contagem: Record<CategoriaPerfil, number> = {
      placar_exato: 0,
      vencedor_gols: 0,
      vencedor_saldo: 0,
      empate_certo: 0,
      so_vencedor: 0,
      erro: 0,
      nao_palpitou: 0,
    }

    for (const row of rowsDoUsuario) {
      contagem[classificarParaPerfil(row)]++
    }

    const total = rowsDoUsuario.length
    const categorias = Object.fromEntries(
      CATEGORIAS.map((categoria) => [
        categoria,
        { quantidade: contagem[categoria], percentual: total === 0 ? 0 : (contagem[categoria] / total) * 100 },
      ]),
    ) as Record<CategoriaPerfil, { quantidade: number; percentual: number }>

    return { usuarioId, nome, totalPalpites: total, categorias }
  })
}
