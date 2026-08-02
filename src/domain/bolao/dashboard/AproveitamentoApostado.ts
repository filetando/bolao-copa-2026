// Donut "aproveitamento de pontos" — diferente da Taxa de Acerto (que conta ACERTOS) e do
// Aproveitamento por Fase (item 4, cujo máximo possível inclui TODOS os jogos da fase, mesmo
// os que o usuário não apostou), aqui o objetivo é: dos jogos que o usuário REALMENTE apostou,
// que % dos PONTOS possíveis (cravar todos eles) ele conseguiu? Ignora por completo os jogos
// não apostados — não entram nem no numerador nem no denominador.
import type { DetalhePalpiteRow } from './DetalhePalpiteRow.js'

const PONTOS_MAXIMOS_BASE = 25 // DOMAIN_RULES.md §7 — placar exato é o acerto de maior valor

export interface AproveitamentoApostadoUsuario {
  usuarioId: string
  nome: string
  totalApostados: number
  pontosObtidos: number
  pontosMaximos: number
  aproveitamento: number
}

export function calcularAproveitamentoApostado(rows: DetalhePalpiteRow[]): AproveitamentoApostadoUsuario[] {
  const porUsuario = new Map<
    string,
    { nome: string; totalApostados: number; pontosObtidos: number; pontosMaximos: number }
  >()

  // Garante uma entrada por usuário mesmo que ele não tenha apostado em nada.
  for (const row of rows) {
    if (!porUsuario.has(row.usuarioId)) {
      porUsuario.set(row.usuarioId, { nome: row.nome, totalApostados: 0, pontosObtidos: 0, pontosMaximos: 0 })
    }
  }

  for (const row of rows) {
    if (row.golsCasaPalpite === null || row.golsForaPalpite === null) continue

    const usuario = porUsuario.get(row.usuarioId)!
    usuario.totalApostados++
    usuario.pontosObtidos += row.pontosObtidos
    usuario.pontosMaximos += Math.round(PONTOS_MAXIMOS_BASE * row.multiplicador)
  }

  return [...porUsuario.entries()].map(
    ([usuarioId, { nome, totalApostados, pontosObtidos, pontosMaximos }]) => ({
      usuarioId,
      nome,
      totalApostados,
      pontosObtidos,
      pontosMaximos,
      aproveitamento: pontosMaximos === 0 ? 0 : (pontosObtidos / pontosMaximos) * 100,
    }),
  )
}
