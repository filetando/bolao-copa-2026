import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { AproveitamentoFase } from '../../../types/index.ts'
import { corDoJogador } from '../../../lib/playerColors.ts'

interface Props {
  data: AproveitamentoFase[]
}

const COR_GRID = '#e7ded2'
const COR_EIXO = '#6b6275'

export function PhaseEfficiencyChart({ data }: Props) {
  if (data.length === 0) {
    return <p className="text-muted text-center py-8 text-sm">Ainda não há partidas encerradas.</p>
  }

  const usuarios = data[0]?.usuarios.map((u) => u.nome) ?? []
  const chartData = data.map((fase) => {
    const linha: Record<string, string | number> = { fase: fase.faseNomeExibicao }
    for (const usuario of fase.usuarios) linha[usuario.nome] = Number(usuario.aproveitamento.toFixed(1))
    return linha
  })

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={COR_GRID} vertical={false} />
        <XAxis
          dataKey="fase"
          tick={{ fontSize: 11, fill: COR_EIXO }}
          axisLine={{ stroke: COR_GRID }}
          tickLine={false}
          interval={0}
          angle={-20}
          textAnchor="end"
          height={50}
        />
        <YAxis
          tick={{ fontSize: 11, fill: COR_EIXO }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
          domain={[0, 100]}
        />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: `1px solid ${COR_GRID}`, fontSize: 12 }}
          formatter={(value: number) => `${value}%`}
          cursor={{ fill: 'rgba(0,0,0,0.03)' }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {usuarios.map((nome, idx) => (
          <Bar key={nome} dataKey={nome} name={nome} fill={corDoJogador(nome, idx)} radius={[4, 4, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
