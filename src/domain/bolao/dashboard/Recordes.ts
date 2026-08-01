// Dashboard item 6 — cards de recorde para dar ritmo ao vídeo. Cada função é independente para
// facilitar leitura e teste; `calcularRecordes` só orquestra.
import type { DetalhePalpiteRow } from './DetalhePalpiteRow.js'
import { classificarComAusencia } from './classificarComAusencia.js'

// Rótulo das 3 rodadas da fase de grupos (não existe coluna no schema — ver
// src/infrastructure/tournament/loadRodadasGrupos.ts, que carrega o dado estático do seed).
export type RodadaGrupo = 'R1' | 'R2' | 'R3'

export interface RecordePorUsuario {
  usuarioId: string
  nome: string
  quantidade: number
}

export interface RecordeRodadaMaisPontuada {
  rotulo: string
  totalPontos: number
}

export interface RecordeJogoQueTodosErraram {
  partidaId: number
  faseNomeExibicao: string
  multiplicador: number
  totalDeJogosAssim: number
  equipeCasaSigla: string | null
  equipeForaSigla: string | null
}

export interface Recordes {
  maisPlacaresExatos: RecordePorUsuario[]
  maiorSequenciaDeAcertos: RecordePorUsuario[]
  rodadaMaisPontuada: RecordeRodadaMaisPontuada | null
  jogoQueTodosErraram: RecordeJogoQueTodosErraram | null
}

function rotuloDaRodada(row: DetalhePalpiteRow, rodadasGrupos: Record<number, RodadaGrupo>): string {
  if (row.faseId === 'grupos') {
    const rodada = rodadasGrupos[row.partidaId]
    return `Fase de grupos — ${rodada ?? '?'}`
  }
  return row.faseNomeExibicao
}

// Mais placares exatos (categoria "placar_exato") por usuário — pode ter empate no topo.
function calcularMaisPlacaresExatos(rows: DetalhePalpiteRow[]): RecordePorUsuario[] {
  const porUsuario = new Map<string, { nome: string; quantidade: number }>()

  for (const row of rows) {
    if (!porUsuario.has(row.usuarioId)) porUsuario.set(row.usuarioId, { nome: row.nome, quantidade: 0 })
    if (classificarComAusencia(row) === 'placar_exato') porUsuario.get(row.usuarioId)!.quantidade++
  }

  return [...porUsuario.entries()]
    .map(([usuarioId, dados]) => ({ usuarioId, ...dados }))
    .sort((a, b) => b.quantidade - a.quantidade)
}

// Maior sequência de palpites consecutivos (em ordem cronológica) sem errar (categoria ≠ "erro").
function calcularMaiorSequenciaDeAcertos(rows: DetalhePalpiteRow[]): RecordePorUsuario[] {
  const porUsuario = new Map<string, DetalhePalpiteRow[]>()
  for (const row of rows) {
    if (!porUsuario.has(row.usuarioId)) porUsuario.set(row.usuarioId, [])
    porUsuario.get(row.usuarioId)!.push(row)
  }

  const resultado: RecordePorUsuario[] = []
  for (const [usuarioId, rowsDoUsuario] of porUsuario.entries()) {
    const ordenadas = [...rowsDoUsuario].sort(
      (a, b) => a.dataHoraUtc.localeCompare(b.dataHoraUtc) || a.partidaId - b.partidaId,
    )

    let maior = 0
    let atual = 0
    for (const row of ordenadas) {
      atual = classificarComAusencia(row) === 'erro' ? 0 : atual + 1
      maior = Math.max(maior, atual)
    }

    resultado.push({ usuarioId, nome: ordenadas[0]?.nome ?? '', quantidade: maior })
  }

  return resultado.sort((a, b) => b.quantidade - a.quantidade)
}

// Rodada/fase com maior soma de pontos entre os 3 jogadores — grupos divididos em R1/R2/R3,
// mata-mata por fase inteira (confirmado com o usuário).
function calcularRodadaMaisPontuada(
  rows: DetalhePalpiteRow[],
  rodadasGrupos: Record<number, RodadaGrupo>,
): RecordeRodadaMaisPontuada | null {
  const porRodada = new Map<string, number>()

  for (const row of rows) {
    const rotulo = rotuloDaRodada(row, rodadasGrupos)
    porRodada.set(rotulo, (porRodada.get(rotulo) ?? 0) + row.pontosObtidos)
  }

  let melhor: RecordeRodadaMaisPontuada | null = null
  for (const [rotulo, totalPontos] of porRodada.entries()) {
    if (!melhor || totalPontos > melhor.totalPontos) melhor = { rotulo, totalPontos }
  }
  return melhor
}

// Partida em que os 3 jogadores erraram (categoria "erro", incluindo quem não apostou) —
// destaca a de maior multiplicador entre as que qualificam, já que é a mais "dolorida". Com
// o cross join de findDetalhesPalpites, toda partida sempre tem uma linha por usuário
// (apostada ou não), então "todo mundo errou" só fica interessante se PELO MENOS UM usuário
// realmente apostou e errou — senão seria só "ninguém apostou nesse jogo", uma história bem
// mais banal que não deveria virar recorde.
function calcularJogoQueTodosErraram(rows: DetalhePalpiteRow[]): RecordeJogoQueTodosErraram | null {
  const porPartida = new Map<number, DetalhePalpiteRow[]>()
  for (const row of rows) {
    if (!porPartida.has(row.partidaId)) porPartida.set(row.partidaId, [])
    porPartida.get(row.partidaId)!.push(row)
  }

  const candidatas: DetalhePalpiteRow[] = []
  for (const rowsDaPartida of porPartida.values()) {
    const alguemApostou = rowsDaPartida.some((row) => row.golsCasaPalpite !== null)
    if (!alguemApostou) continue

    const todosErraram = rowsDaPartida.every((row) => classificarComAusencia(row) === 'erro')
    if (todosErraram) candidatas.push(rowsDaPartida[0])
  }

  if (candidatas.length === 0) return null

  const destaque = candidatas.reduce((a, b) => (b.multiplicador > a.multiplicador ? b : a))
  return {
    partidaId: destaque.partidaId,
    faseNomeExibicao: destaque.faseNomeExibicao,
    multiplicador: destaque.multiplicador,
    totalDeJogosAssim: candidatas.length,
    equipeCasaSigla: destaque.equipeCasaSigla,
    equipeForaSigla: destaque.equipeForaSigla,
  }
}

export function calcularRecordes(
  rows: DetalhePalpiteRow[],
  rodadasGrupos: Record<number, RodadaGrupo>,
): Recordes {
  return {
    maisPlacaresExatos: calcularMaisPlacaresExatos(rows),
    maiorSequenciaDeAcertos: calcularMaiorSequenciaDeAcertos(rows),
    rodadaMaisPontuada: calcularRodadaMaisPontuada(rows, rodadasGrupos),
    jogoQueTodosErraram: calcularJogoQueTodosErraram(rows),
  }
}
