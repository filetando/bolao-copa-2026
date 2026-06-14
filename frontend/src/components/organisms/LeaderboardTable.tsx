import { useAuth } from '../../contexts/AuthContext.tsx'
import type { LeaderboardRow } from '../../types/index.ts'

interface Props {
  rows: LeaderboardRow[]
}

export function LeaderboardTable({ rows }: Props) {
  const { user } = useAuth()

  if (rows.length === 0) {
    return <p className="text-gray-500 text-center py-8">Nenhum participante ainda.</p>
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b-2 border-gray-200 text-left text-gray-500 text-xs uppercase tracking-wide">
          <th className="pb-3 pr-4 w-10">#</th>
          <th className="pb-3">Participante</th>
          <th className="pb-3 text-right">Pontos</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const isMe = row.usuarioId === user?.id
          const medal = row.posicao === 1 ? '🥇' : row.posicao === 2 ? '🥈' : row.posicao === 3 ? '🥉' : null
          return (
            <tr
              key={row.usuarioId}
              className={`border-b border-gray-100 ${isMe ? 'bg-green-50' : ''}`}
            >
              <td className="py-3 pr-4 text-gray-400 font-mono text-xs">
                {medal ?? row.posicao}
              </td>
              <td className="py-3 text-gray-900">
                <span className={isMe ? 'font-semibold' : ''}>{row.nome}</span>
                {isMe && <span className="ml-1.5 text-xs text-green-700 font-normal">(você)</span>}
              </td>
              <td className="py-3 text-right font-mono font-semibold text-gray-900">{row.totalPontos}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
