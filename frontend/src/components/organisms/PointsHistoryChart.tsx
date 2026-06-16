import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { LeaderboardHistoryResponse } from '../../types/index.ts'

interface Props {
  data: LeaderboardHistoryResponse
}

const CORES = ['#16a34a', '#2563eb', '#dc2626', '#ca8a04', '#9333ea', '#0891b2', '#db2777', '#65a30d']

export function PointsHistoryChart({ data }: Props) {
  if (data.usuarios.length === 0 || data.pontos.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8 text-sm">
        Ainda não há partidas encerradas para exibir o histórico.
      </p>
    )
  }

  const chartData = data.pontos.map((ponto) => ({
    data: new Date(ponto.dataHoraUtc).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    ...ponto.pontosPorUsuario,
  }))

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={chartData} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
        <XAxis dataKey="data" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={{ stroke: '#e5e7eb' }} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {data.usuarios.map((usuario, idx) => (
          <Line
            key={usuario.usuarioId}
            type="monotone"
            dataKey={usuario.usuarioId}
            name={usuario.nome}
            stroke={CORES[idx % CORES.length]}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
