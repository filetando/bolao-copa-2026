import { describe, it, expect } from 'vitest'
import { ClassificacaoService, type EquipeInput, type PartidaGrupoEncerrada } from '../ClassificacaoService.js'

// Helpers
function makeEquipe(id: number, nome: string, rankingFifa = 999): EquipeInput {
  return { id, nome, sigla: nome.slice(0, 3).toUpperCase(), bandeiraCodigo: null, rankingFifa }
}
function partida(casaId: number, foraId: number, gc: number, gf: number): PartidaGrupoEncerrada {
  return { equipeCasaId: casaId, equipeForaId: foraId, golsCasa: gc, golsFora: gf }
}

describe('ClassificacaoService', () => {
  // ─── 1. Classificação trivial ──────────────────────────────────────────────
  it('ordena 4 equipes com pontos distintos sem desempate', () => {
    const [A, B, C, D] = [1, 2, 3, 4].map((i) => makeEquipe(i, `Equipe${i}`))
    const partidas = [
      // A=9pts (3V), B=6pts (2V), C=3pts (1V), D=0pts
      partida(A.id, B.id, 1, 0),
      partida(A.id, C.id, 1, 0),
      partida(A.id, D.id, 1, 0),
      partida(B.id, C.id, 1, 0),
      partida(B.id, D.id, 1, 0),
      partida(C.id, D.id, 1, 0),
    ]
    const result = ClassificacaoService.calcular([A, B, C, D], partidas)
    expect(result.map((r) => r.equipe.id)).toEqual([A.id, B.id, C.id, D.id])
    expect(result.map((r) => r.posicao)).toEqual([1, 2, 3, 4])
    expect(result[0].pontos).toBe(9)
    expect(result[1].pontos).toBe(6)
    expect(result[2].pontos).toBe(3)
    expect(result[3].pontos).toBe(0)
  })

  // ─── 2. Empate de 2 resolvido por confronto direto ─────────────────────────
  it('desempata 2 equipes pelo confronto direto (H2H)', () => {
    const [A, B, C, D] = [1, 2, 3, 4].map((i) => makeEquipe(i, `Equipe${i}`))
    // A e B empatam em pontos; A venceu B no H2H → A na frente
    const partidas = [
      partida(A.id, B.id, 2, 0), // A bate B
      partida(A.id, C.id, 0, 1), // A perde para C
      partida(A.id, D.id, 1, 0), // A bate D
      partida(B.id, C.id, 1, 0), // B bate C
      partida(B.id, D.id, 1, 0), // B bate D
      partida(C.id, D.id, 0, 0), // empate
    ]
    // A: 3+0+3=6, B: 0+3+3=6, C: 3+0+1=4, D: 0+0+1=1 (empatam A e B em 6)
    const result = ClassificacaoService.calcular([A, B, C, D], partidas)
    expect(result[0].equipe.id).toBe(A.id) // A venceu B no H2H → A é 1º
    expect(result[1].equipe.id).toBe(B.id)
  })

  // ─── 3. H2H empatado → critério 4 (saldo geral) ───────────────────────────
  it('usa saldo de gols geral quando H2H não resolve o empate', () => {
    const [A, B, C, D] = [1, 2, 3, 4].map((i) => makeEquipe(i, `Equipe${i}`))
    // A e B empatados em pts e H2H (empate 0-0 entre si); A tem saldo geral melhor
    const partidas = [
      partida(A.id, B.id, 0, 0), // H2H empate
      partida(A.id, C.id, 3, 0), // A com saldo forte
      partida(A.id, D.id, 3, 0),
      partida(B.id, C.id, 1, 0), // B com saldo menor
      partida(B.id, D.id, 1, 0),
      partida(C.id, D.id, 0, 0),
    ]
    // A: 1+3+3=7pts, B: 1+3+3=7pts; H2H 0-0 → saldo geral: A=+6, B=+2
    const result = ClassificacaoService.calcular([A, B, C, D], partidas)
    expect(result[0].equipe.id).toBe(A.id)
    expect(result[1].equipe.id).toBe(B.id)
  })

  // ─── 4. Empate triplo com reiteração ──────────────────────────────────────
  it('aplica reiteração em empate triplo', () => {
    // 3 equipes com 3pts cada (vitórias circulares)
    // H2H saldo: B(+2) > A(-1) = C(-1) → B separado; reiteração para {A,C}
    // Reiteração {A,C}: C venceu A 2-0 → C na frente de A
    // Esperado: B(1º), C(2º), A(3º)
    const A = makeEquipe(1, 'Alpha')
    const B = makeEquipe(2, 'Beta')
    const C = makeEquipe(3, 'Gama')
    const partidas = [
      partida(A.id, B.id, 1, 0), // A bate B (margin 1)
      partida(C.id, A.id, 2, 0), // C bate A (margin 2)
      partida(B.id, C.id, 3, 0), // B bate C (margin 3)
    ]
    // Pontos: A=3, B=3, C=3
    // H2H saldo: A=+1-2=-1, B=-1+3=+2, C=-3+2=-1
    const result = ClassificacaoService.calcular([A, B, C], partidas)
    expect(result.map((r) => r.equipe.id)).toEqual([B.id, C.id, A.id])
  })

  // ─── 5. Ranking FIFA como desempate ────────────────────────────────────────
  it('usa ranking FIFA quando todos os outros critérios empatam', () => {
    // Vitórias circulares com mesma margem → H2H e saldo geral todos iguais
    // Desempate pelo rankingFifa: B(10) < C(20) < A(30) → B 1º
    const A = makeEquipe(1, 'Alpha', 30)
    const B = makeEquipe(2, 'Beta', 10)
    const C = makeEquipe(3, 'Gama', 20)
    const partidas = [
      partida(A.id, B.id, 1, 0),
      partida(B.id, C.id, 1, 0),
      partida(C.id, A.id, 1, 0),
    ]
    const result = ClassificacaoService.calcular([A, B, C], partidas)
    expect(result.map((r) => r.equipe.id)).toEqual([B.id, C.id, A.id])
  })

  // ─── 6. Ordem alfabética como desempate final ──────────────────────────────
  it('usa ordem alfabética quando tudo mais empata (incluindo FIFA)', () => {
    const A = makeEquipe(1, 'Gama', 50)
    const B = makeEquipe(2, 'Alpha', 50)
    const C = makeEquipe(3, 'Beta', 50)
    const partidas = [
      partida(A.id, B.id, 1, 0),
      partida(B.id, C.id, 1, 0),
      partida(C.id, A.id, 1, 0),
    ]
    const result = ClassificacaoService.calcular([A, B, C], partidas)
    expect(result.map((r) => r.equipe.nome)).toEqual(['Alpha', 'Beta', 'Gama'])
  })

  // ─── 7. Estatísticas individuais corretas ──────────────────────────────────
  it('calcula estatísticas de V/E/D/GP/GC/SG corretamente', () => {
    const [A, B] = [1, 2].map((i) => makeEquipe(i, `Equipe${i}`))
    const partidas = [
      partida(A.id, B.id, 3, 1),
      partida(B.id, A.id, 0, 2),
    ]
    const result = ClassificacaoService.calcular([A, B], partidas)
    const linhaA = result.find((r) => r.equipe.id === A.id)!
    expect(linhaA.jogos).toBe(2)
    expect(linhaA.vitorias).toBe(2)
    expect(linhaA.empates).toBe(0)
    expect(linhaA.derrotas).toBe(0)
    expect(linhaA.golsMarcados).toBe(5)
    expect(linhaA.golsSofridos).toBe(1)
    expect(linhaA.saldoGols).toBe(4)
    expect(linhaA.pontos).toBe(6)
  })

  // ─── 8. Grupo sem partidas encerradas ─────────────────────────────────────
  it('retorna todas as equipes com estatísticas zeradas se nenhuma partida foi encerrada', () => {
    const equipes = [1, 2, 3, 4].map((i) => makeEquipe(i, `Equipe${i}`))
    const result = ClassificacaoService.calcular(equipes, [])
    expect(result).toHaveLength(4)
    expect(result.every((r) => r.pontos === 0 && r.jogos === 0)).toBe(true)
  })
})
