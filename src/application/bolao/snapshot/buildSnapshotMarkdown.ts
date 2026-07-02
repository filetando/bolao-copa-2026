import type { LeaderboardRow } from '../use-cases/GetLeaderboard.js'
import type { UltimoPalpiteFinalizadoRow } from '../ports/PalpiteRepository.js'

export interface SnapshotContexto {
  partidaId: number
  motivo: 'insercao' | 'correcao'
  geradoEm: Date
}

function formatarDataHora(data: Date): string {
  return data.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'medium' }) + ' BRT'
}

function labelLado(equipe: { nome: string } | null, placeholder: string | null): string {
  return equipe?.nome ?? placeholder ?? '?'
}

// Snapshot de auditoria — disparado sempre que um placar de partida é inserido ou corrigido
// (ver RegisterMatchResult), para deixar registro do estado da classificação e do último
// palpite finalizado de cada usuário naquele momento.
export function buildSnapshotMarkdown(
  ranking: LeaderboardRow[],
  ultimosPalpites: UltimoPalpiteFinalizadoRow[],
  contexto: SnapshotContexto,
): string {
  const linhas: string[] = []

  linhas.push(`# Snapshot — Partida ${contexto.partidaId} (${contexto.motivo === 'insercao' ? 'resultado inserido' : 'resultado corrigido'})`)
  linhas.push('')
  linhas.push(`Gerado em: ${formatarDataHora(contexto.geradoEm)}`)
  linhas.push('')
  linhas.push('## Classificação Geral')
  linhas.push('')

  if (ranking.length === 0) {
    linhas.push('_Nenhum usuário na classificação._')
  } else {
    linhas.push('| # | Usuário | Pontos |')
    linhas.push('|---|---------|--------|')
    for (const row of ranking) {
      linhas.push(`| ${row.posicao} | ${row.nome} | ${row.totalPontos} |`)
    }
  }

  linhas.push('')
  linhas.push('## Último palpite finalizado por usuário')
  linhas.push('')

  if (ultimosPalpites.length === 0) {
    linhas.push('_Nenhum palpite finalizado ainda._')
  } else {
    for (const p of ultimosPalpites) {
      const casa = labelLado(p.partida.equipeCasa, p.partida.placeholderCasa)
      const fora = labelLado(p.partida.equipeFora, p.partida.placeholderFora)
      linhas.push(`### ${p.nomeUsuario}`)
      linhas.push('')
      linhas.push(`- Partida: ${casa} x ${fora} (${p.partida.faseNome}, jogo ${p.partida.id})`)
      linhas.push(`- Placar real: ${p.partida.golsCasa} x ${p.partida.golsFora}`)
      linhas.push(`- Palpite: ${p.golsCasaPalpite} x ${p.golsForaPalpite}`)
      linhas.push(`- Pontos obtidos: ${p.pontosObtidos ?? 0}`)
      linhas.push('')
    }
  }

  return linhas.join('\n')
}
