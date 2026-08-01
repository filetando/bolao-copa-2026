// Dashboard item 3 — total de pontos de cada jogador empilhado por fase, já com o
// multiplicador aplicado (pontosObtidos já vem final — DOMAIN_RULES.md §8).
import type { DetalhePalpiteRow } from './DetalhePalpiteRow.js'

export interface PontosPorFaseUsuario {
  usuarioId: string
  nome: string
  fases: { faseId: string; faseNomeExibicao: string; faseOrdem: number; pontos: number }[]
}

export function calcularPontosPorFase(rows: DetalhePalpiteRow[]): PontosPorFaseUsuario[] {
  const porUsuario = new Map<string, { nome: string; porFase: Map<string, { faseNomeExibicao: string; faseOrdem: number; pontos: number }> }>()

  for (const row of rows) {
    if (!porUsuario.has(row.usuarioId)) porUsuario.set(row.usuarioId, { nome: row.nome, porFase: new Map() })
    const usuario = porUsuario.get(row.usuarioId)!

    if (!usuario.porFase.has(row.faseId)) {
      usuario.porFase.set(row.faseId, { faseNomeExibicao: row.faseNomeExibicao, faseOrdem: row.faseOrdem, pontos: 0 })
    }
    usuario.porFase.get(row.faseId)!.pontos += row.pontosObtidos
  }

  return [...porUsuario.entries()].map(([usuarioId, { nome, porFase }]) => ({
    usuarioId,
    nome,
    fases: [...porFase.entries()]
      .map(([faseId, dados]) => ({ faseId, ...dados }))
      .sort((a, b) => a.faseOrdem - b.faseOrdem),
  }))
}
