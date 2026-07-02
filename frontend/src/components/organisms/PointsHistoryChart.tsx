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

// Série de cores alinhada à paleta "Festa nas Arquibancadas" (DESIGN_SYSTEM.md).
// Recharts exige valores de cor em JS — não há como usar utilitários do Tailwind aqui.
const CORES = ['#e0480e', '#6d28d9', '#0ea5a5', '#15803d', '#d99412', '#dc2626', '#2563eb', '#db2777']
const COR_GRID = '#e7ded2' // --color-border
const COR_EIXO = '#6b6275' // --color-muted

export function PointsHistoryChart({ data }: Props) {
  if (data.usuarios.length === 0 || data.pontos.length === 0) {
    return (
      <p className="text-muted text-center py-8 text-sm">
        Ainda não há partidas encerradas para exibir o histórico.
      </p>
    )
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })

  const chartData = data.pontos.map((ponto) => ({
    dataHoraUtc: ponto.dataHoraUtc,
    ...ponto.pontosPorUsuario,
  }))

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={chartData} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={COR_GRID} vertical={false} />
        <XAxis
          dataKey="dataHoraUtc"
          tickFormatter={formatDate}
          tick={{ fontSize: 11, fill: COR_EIXO }}
          axisLine={{ stroke: COR_GRID }}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 11, fill: COR_EIXO }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: `1px solid ${COR_GRID}`, fontSize: 12 }}
          labelFormatter={formatDate}
        />
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
