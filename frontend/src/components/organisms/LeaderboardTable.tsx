import { useAuth } from '../../contexts/AuthContext.tsx'
import type { LeaderboardRow } from '../../types/index.ts'

interface Props {
  rows: LeaderboardRow[]
}

// Estilo do "selo" de posição: pódio (1º/2º/3º) ganha cor de medalha
function posicaoStyle(posicao: number): string {
  if (posicao === 1) return 'bg-gold text-white shadow-glow'
  if (posicao === 2) return 'bg-silver text-white'
  if (posicao === 3) return 'bg-bronze text-white'
  return 'bg-surface-2 text-muted'
}

export function LeaderboardTable({ rows }: Props) {
  const { user } = useAuth()

  if (rows.length === 0) {
    return <p className="text-muted text-center py-8">Nenhum participante ainda.</p>
  }

  return (
    <table className="w-full text-sm border-separate border-spacing-y-1">
      <thead>
        <tr className="text-left text-muted text-xs uppercase tracking-wide">
          <th className="pb-2 pl-2 w-12">#</th>
          <th className="pb-2">Participante</th>
          <th className="pb-2 pr-2 text-right">Pontos</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const isMe = row.usuarioId === user?.id
          const medal = row.posicao === 1 ? '🥇' : row.posicao === 2 ? '🥈' : row.posicao === 3 ? '🥉' : null
          const isLeader = row.posicao === 1
          return (
            <tr
              key={row.usuarioId}
              className={`transition-colors ${isMe ? 'bg-accent/10' : 'bg-surface hover:bg-surface-2'}`}
            >
              <td className={`py-2.5 pl-2 rounded-l-md ${isMe ? 'border-l-4 border-l-accent' : ''}`}>
                <span
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold font-mono ${posicaoStyle(row.posicao)}`}
                  aria-label={`Posição ${row.posicao}`}
                >
                  {medal ?? row.posicao}
                </span>
              </td>
              <td className="py-2.5 text-text">
                <span className={isMe || isLeader ? 'font-semibold' : ''}>{row.nome}</span>
                {isMe && <span className="ml-1.5 text-xs text-accent font-medium">(você)</span>}
              </td>
              <td
                className={`py-2.5 pr-2 text-right rounded-r-md font-mono font-bold tabular-nums ${
                  isLeader ? 'text-primary' : 'text-text'
                }`}
              >
                {row.totalPontos}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
