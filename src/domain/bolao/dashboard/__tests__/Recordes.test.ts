import { describe, expect, it } from 'vitest'
import { calcularRecordes, type RodadaGrupo } from '../Recordes.js'
import type { DetalhePalpiteRow } from '../DetalhePalpiteRow.js'

function row(overrides: Partial<DetalhePalpiteRow>): DetalhePalpiteRow {
  return {
    usuarioId: 'u1',
    nome: 'Lucas',
    partidaId: 1,
    faseId: 'grupos',
    faseNomeExibicao: 'Fase de Grupos',
    faseOrdem: 1,
    multiplicador: 1,
    golsCasa: 2,
    golsFora: 1,
    golsCasaPalpite: 2,
    golsForaPalpite: 1,
    pontosObtidos: 25,
    dataHoraUtc: '2026-06-11T19:00:00Z',
    equipeCasaSigla: 'MEX',
    equipeForaSigla: 'AFS',
    ...overrides,
  }
}

// Cenário: 2 jogos de grupo (R1 e R2) + a final (×4), 2 usuários.
// Partida 1 (R1): Lucas cravou (25), João errou (0).
// Partida 2 (R2): Lucas cravou de novo (25), João também cravou (25).
// Partida 104 (final, ×4): ambos erraram (0 e 0) — "jogo que todo mundo errou".
const rows: DetalhePalpiteRow[] = [
  row({ usuarioId: 'u1', nome: 'Lucas', partidaId: 1, dataHoraUtc: '2026-06-11T19:00:00Z', pontosObtidos: 25 }),
  row({
    usuarioId: 'u2',
    nome: 'João',
    partidaId: 1,
    dataHoraUtc: '2026-06-11T19:00:00Z',
    golsCasaPalpite: 0,
    golsForaPalpite: 0,
    pontosObtidos: 0,
  }),
  row({ usuarioId: 'u1', nome: 'Lucas', partidaId: 2, dataHoraUtc: '2026-06-15T19:00:00Z', pontosObtidos: 25 }),
  row({ usuarioId: 'u2', nome: 'João', partidaId: 2, dataHoraUtc: '2026-06-15T19:00:00Z', pontosObtidos: 25 }),
  row({
    usuarioId: 'u1',
    nome: 'Lucas',
    partidaId: 104,
    faseId: 'final',
    faseNomeExibicao: 'Final',
    faseOrdem: 7,
    multiplicador: 4,
    dataHoraUtc: '2026-07-19T19:00:00Z',
    golsCasaPalpite: 0,
    golsForaPalpite: 0,
    pontosObtidos: 0,
    equipeCasaSigla: 'BRA',
    equipeForaSigla: 'ARG',
  }),
  row({
    usuarioId: 'u2',
    nome: 'João',
    partidaId: 104,
    faseId: 'final',
    faseNomeExibicao: 'Final',
    faseOrdem: 7,
    multiplicador: 4,
    dataHoraUtc: '2026-07-19T19:00:00Z',
    golsCasaPalpite: 0,
    golsForaPalpite: 0,
    pontosObtidos: 0,
    equipeCasaSigla: 'BRA',
    equipeForaSigla: 'ARG',
  }),
]

const rodadasGrupos: Record<number, RodadaGrupo> = { 1: 'R1', 2: 'R2' }

describe('calcularRecordes', () => {
  it('mais placares exatos: Lucas 2, João 1, ordenado desc', () => {
    const { maisPlacaresExatos } = calcularRecordes(rows, rodadasGrupos)

    expect(maisPlacaresExatos).toEqual([
      { usuarioId: 'u1', nome: 'Lucas', quantidade: 2 },
      { usuarioId: 'u2', nome: 'João', quantidade: 1 },
    ])
  })

  it('maior sequência de acertos: Lucas acerta 2 seguidos antes de errar a final; João acerta só 1', () => {
    const { maiorSequenciaDeAcertos } = calcularRecordes(rows, rodadasGrupos)

    expect(maiorSequenciaDeAcertos).toEqual([
      { usuarioId: 'u1', nome: 'Lucas', quantidade: 2 },
      { usuarioId: 'u2', nome: 'João', quantidade: 1 },
    ])
  })

  it('rodada mais pontuada: R2 (25+25=50) supera R1 (25+0=25) e a final (0+0=0)', () => {
    const { rodadaMaisPontuada } = calcularRecordes(rows, rodadasGrupos)

    expect(rodadaMaisPontuada).toEqual({ rotulo: 'Fase de grupos — R2', totalPontos: 50 })
  })

  it('jogo que todo mundo errou: a final, com multiplicador 4 e o confronto real', () => {
    const { jogoQueTodosErraram } = calcularRecordes(rows, rodadasGrupos)

    expect(jogoQueTodosErraram).toEqual({
      partidaId: 104,
      faseNomeExibicao: 'Final',
      multiplicador: 4,
      totalDeJogosAssim: 1,
      equipeCasaSigla: 'BRA',
      equipeForaSigla: 'ARG',
    })
  })

  it('sem nenhuma partida com erro geral, retorna null', () => {
    const semErroGeral = rows.filter((r) => r.partidaId !== 104)

    const { jogoQueTodosErraram } = calcularRecordes(semErroGeral, rodadasGrupos)

    expect(jogoQueTodosErraram).toBeNull()
  })

  it('conta como "todo mundo errou" mesmo se só 1 de 2 apostou (o outro conta como erro por ausência)', () => {
    // Só o Lucas apostou na partida 3 (e errou) — João nem palpitou, o que conta como erro
    // também. Regra confirmada com o usuário: não apostar = errar.
    const comPalpiteSolitario = [
      ...rows,
      row({
        usuarioId: 'u1',
        nome: 'Lucas',
        partidaId: 3,
        faseId: 'grupos',
        faseOrdem: 1,
        dataHoraUtc: '2026-06-20T19:00:00Z',
        golsCasaPalpite: 0,
        golsForaPalpite: 0,
        golsCasa: 2,
        golsFora: 1,
        pontosObtidos: 0,
      }),
      row({
        usuarioId: 'u2',
        nome: 'João',
        partidaId: 3,
        faseId: 'grupos',
        faseOrdem: 1,
        dataHoraUtc: '2026-06-20T19:00:00Z',
        golsCasaPalpite: null,
        golsForaPalpite: null,
        golsCasa: 2,
        golsFora: 1,
        pontosObtidos: 0,
      }),
    ]

    const { jogoQueTodosErraram } = calcularRecordes(comPalpiteSolitario, rodadasGrupos)

    // Agora tem 2 candidatas: a final (mult 4) continua vencendo o desempate por ter
    // multiplicador maior que a partida 3 (mult 1, default do fixture).
    expect(jogoQueTodosErraram?.partidaId).toBe(104)
    expect(jogoQueTodosErraram?.totalDeJogosAssim).toBe(2)
  })

  it('não conta "todo mundo errou" se ninguém apostou na partida', () => {
    const ninguemApostou = [
      ...rows,
      row({
        usuarioId: 'u1',
        nome: 'Lucas',
        partidaId: 5,
        faseId: 'grupos',
        faseOrdem: 1,
        dataHoraUtc: '2026-06-21T19:00:00Z',
        golsCasaPalpite: null,
        golsForaPalpite: null,
        pontosObtidos: 0,
      }),
      row({
        usuarioId: 'u2',
        nome: 'João',
        partidaId: 5,
        faseId: 'grupos',
        faseOrdem: 1,
        dataHoraUtc: '2026-06-21T19:00:00Z',
        golsCasaPalpite: null,
        golsForaPalpite: null,
        pontosObtidos: 0,
      }),
    ]

    const { jogoQueTodosErraram } = calcularRecordes(ninguemApostou, rodadasGrupos)

    // Continua sendo só a final (partida 5 não qualifica, ninguém apostou nela).
    expect(jogoQueTodosErraram?.partidaId).toBe(104)
    expect(jogoQueTodosErraram?.totalDeJogosAssim).toBe(1)
  })
})
