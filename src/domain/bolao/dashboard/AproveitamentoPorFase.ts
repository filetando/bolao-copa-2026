// Dashboard item 4 — corrige a distorção dos multiplicadores: pontos do jogador dividido pelo
// máximo possível na fase (cravar placar exato = 25 pts base em todos os jogos da fase,
// multiplicador aplicado — DOMAIN_RULES.md §7/§8). Mostra quem apostou melhor, não só quem
// pontuou mais.
import type { DetalhePalpiteRow } from './DetalhePalpiteRow.js'

const PONTOS_MAXIMOS_BASE = 25

export interface AproveitamentoFaseUsuario {
  usuarioId: string
  nome: string
  pontos: number
  aproveitamento: number
}

export interface AproveitamentoFase {
  faseId: string
  faseNomeExibicao: string
  faseOrdem: number
  maxPossivel: number
  usuarios: AproveitamentoFaseUsuario[]
}

export function calcularAproveitamentoPorFase(rows: DetalhePalpiteRow[]): AproveitamentoFase[] {
  const porFase = new Map<
    string,
    {
      faseNomeExibicao: string
      faseOrdem: number
      multiplicador: number
      jogos: Set<number>
      pontosPorUsuario: Map<string, { nome: string; pontos: number }>
    }
  >()

  for (const row of rows) {
    if (!porFase.has(row.faseId)) {
      porFase.set(row.faseId, {
        faseNomeExibicao: row.faseNomeExibicao,
        faseOrdem: row.faseOrdem,
        multiplicador: row.multiplicador,
        jogos: new Set(),
        pontosPorUsuario: new Map(),
      })
    }
    const fase = porFase.get(row.faseId)!
    fase.jogos.add(row.partidaId)

    if (!fase.pontosPorUsuario.has(row.usuarioId)) {
      fase.pontosPorUsuario.set(row.usuarioId, { nome: row.nome, pontos: 0 })
    }
    fase.pontosPorUsuario.get(row.usuarioId)!.pontos += row.pontosObtidos
  }

  return [...porFase.entries()]
    .map(([faseId, fase]) => {
      const maxPossivel = Math.round(PONTOS_MAXIMOS_BASE * fase.multiplicador) * fase.jogos.size
      return {
        faseId,
        faseNomeExibicao: fase.faseNomeExibicao,
        faseOrdem: fase.faseOrdem,
        maxPossivel,
        usuarios: [...fase.pontosPorUsuario.entries()].map(([usuarioId, { nome, pontos }]) => ({
          usuarioId,
          nome,
          pontos,
          aproveitamento: maxPossivel === 0 ? 0 : (pontos / maxPossivel) * 100,
        })),
      }
    })
    .sort((a, b) => a.faseOrdem - b.faseOrdem)
}
