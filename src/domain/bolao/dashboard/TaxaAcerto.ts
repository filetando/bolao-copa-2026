// Donut "taxa de acerto" — ao contrário do perfil de acerto (item 2, que trata ausência como
// erro), aqui o denominador é só o que o usuário REALMENTE apostou. Objetivo: evidenciar quem
// acerta mais quando aposta, separando essa causa de "esqueceu de apostar" (que já aparece no
// perfil de acerto e no total de pontos, mas fica escondida numa métrica de % de acerto).
import { RegraPontuacao } from '../RegraPontuacao.js'
import type { DetalhePalpiteRow } from './DetalhePalpiteRow.js'

export interface TaxaAcertoUsuario {
  usuarioId: string
  nome: string
  totalApostados: number
  acertos: number
  taxaAcerto: number
}

export function calcularTaxaAcerto(rows: DetalhePalpiteRow[]): TaxaAcertoUsuario[] {
  const porUsuario = new Map<string, { nome: string; totalApostados: number; acertos: number }>()

  // Garante uma entrada por usuário mesmo que ele não tenha apostado em nada (evita "sumir"
  // do donut em vez de mostrar 0%).
  for (const row of rows) {
    if (!porUsuario.has(row.usuarioId)) {
      porUsuario.set(row.usuarioId, { nome: row.nome, totalApostados: 0, acertos: 0 })
    }
  }

  for (const row of rows) {
    if (row.golsCasaPalpite === null || row.golsForaPalpite === null) continue

    const usuario = porUsuario.get(row.usuarioId)!
    usuario.totalApostados++

    const categoria = RegraPontuacao.classificar(
      { golsCasa: row.golsCasaPalpite, golsFora: row.golsForaPalpite },
      { golsCasa: row.golsCasa, golsFora: row.golsFora },
    )
    if (categoria !== 'erro') usuario.acertos++
  }

  return [...porUsuario.entries()].map(([usuarioId, { nome, totalApostados, acertos }]) => ({
    usuarioId,
    nome,
    totalApostados,
    acertos,
    taxaAcerto: totalApostados === 0 ? 0 : (acertos / totalApostados) * 100,
  }))
}
