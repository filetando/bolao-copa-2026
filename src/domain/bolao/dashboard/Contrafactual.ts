// Dashboard item 5 — "foi a final de 4x que decidiu o campeão?": recalcula os pontos de cada
// palpite ignorando o multiplicador da fase (tudo 1x) e compara com o total real.
import { RegraPontuacao } from '../RegraPontuacao.js'
import type { DetalhePalpiteRow } from './DetalhePalpiteRow.js'

export interface ContrafactualUsuario {
  usuarioId: string
  nome: string
  pontosReais: number
  pontosSemMultiplicador: number
}

export function calcularContrafactual(rows: DetalhePalpiteRow[]): ContrafactualUsuario[] {
  const porUsuario = new Map<string, { nome: string; pontosReais: number; pontosSemMultiplicador: number }>()

  for (const row of rows) {
    if (!porUsuario.has(row.usuarioId)) {
      porUsuario.set(row.usuarioId, { nome: row.nome, pontosReais: 0, pontosSemMultiplicador: 0 })
    }
    const usuario = porUsuario.get(row.usuarioId)!
    usuario.pontosReais += row.pontosObtidos
    usuario.pontosSemMultiplicador += RegraPontuacao.calcular(
      { golsCasa: row.golsCasaPalpite, golsFora: row.golsForaPalpite },
      { golsCasa: row.golsCasa, golsFora: row.golsFora },
      1,
    )
  }

  return [...porUsuario.entries()].map(([usuarioId, dados]) => ({ usuarioId, ...dados }))
}
