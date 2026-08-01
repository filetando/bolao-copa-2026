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
import { corDoJogador } from '../../lib/playerColors.ts'

interface Props {
  data: LeaderboardHistoryResponse
}

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
    equipeCasaSigla: ponto.equipeCasaSigla,
    equipeForaSigla: ponto.equipeForaSigla,
    ...ponto.pontosPorUsuario,
  }))

  const formatTitulo = (iso: string) => {
    const ponto = chartData.find((p) => p.dataHoraUtc === iso)
    const confronto =
      ponto?.equipeCasaSigla && ponto?.equipeForaSigla ? ` - ${ponto.equipeCasaSigla} x ${ponto.equipeForaSigla}` : ''
    return `${formatDate(iso)}${confronto}`
  }

  // Tooltip customizado: ordena por maior pontuação (quem passa à frente aparece em cima)
  // e mostra o ganho de pontos (+xx) em relação ao ponto anterior do histórico.
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean
    payload?: Array<{ dataKey: string | number; value?: number; name?: string; color?: string }>
    label?: unknown
  }) => {
    if (!active || !payload || payload.length === 0) return null

    const idx = chartData.findIndex((p) => p.dataHoraUtc === label)
    const anterior = idx > 0 ? (chartData[idx - 1] as Record<string, unknown>) : null

    const ordenado = [...payload].sort((a, b) => (b.value ?? 0) - (a.value ?? 0))

    return (
      <div
        style={{
          borderRadius: 12,
          border: `1px solid ${COR_GRID}`,
          fontSize: 12,
          background: '#fff',
          padding: '8px 12px',
        }}
      >
        <p style={{ marginBottom: 4, fontWeight: 600 }}>{formatTitulo(String(label))}</p>
        {ordenado.map((entry) => {
          const valorAnterior = anterior ? (anterior[entry.dataKey] as number | undefined) : undefined
          const ganho =
            valorAnterior !== undefined && entry.value !== undefined ? entry.value - valorAnterior : undefined

          return (
            <div key={entry.dataKey} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {ganho !== undefined && ganho > 0 && (
                <span style={{ fontWeight: 600 }}> (+{ganho})</span>
              )}
            </div>
          )
        })}
      </div>
    )
  }

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
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {data.usuarios.map((usuario, idx) => (
          <Line
            key={usuario.usuarioId}
            type="monotone"
            dataKey={usuario.usuarioId}
            name={usuario.nome}
            stroke={corDoJogador(usuario.nome, idx)}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            dot={false}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
