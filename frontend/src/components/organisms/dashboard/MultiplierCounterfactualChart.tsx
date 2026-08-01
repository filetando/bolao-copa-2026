import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { ContrafactualUsuario } from '../../../types/index.ts'

interface Props {
  data: ContrafactualUsuario[]
}

const COR_GRID = '#e7ded2'
const COR_EIXO = '#6b6275'
const COR_REAL = '#e0480e' // --color-primary — o que realmente aconteceu
const COR_SEM_MULTIPLICADOR = '#9c94a3' // --color-locked — cenário hipotético

export function MultiplierCounterfactualChart({ data }: Props) {
  if (data.length === 0) {
    return <p className="text-muted text-center py-8 text-sm">Ainda não há pontos suficientes.</p>
  }

  const chartData = data
    .map((usuario) => ({
      nome: usuario.nome,
      Real: usuario.pontosReais,
      'Sem multiplicador (1x)': usuario.pontosSemMultiplicador,
    }))
    .sort((a, b) => b.Real - a.Real)

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 24, left: 0, bottom: 0 }} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke={COR_GRID} horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: COR_EIXO }} axisLine={{ stroke: COR_GRID }} tickLine={false} allowDecimals={false} />
        <YAxis type="category" dataKey="nome" tick={{ fontSize: 12, fill: COR_EIXO }} axisLine={false} tickLine={false} width={90} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: `1px solid ${COR_GRID}`, fontSize: 12 }}
          cursor={{ fill: 'rgba(0,0,0,0.03)' }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="Real" fill={COR_REAL} radius={[0, 4, 4, 0]} />
        <Bar dataKey="Sem multiplicador (1x)" fill={COR_SEM_MULTIPLICADOR} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
