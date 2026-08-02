import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { corDoJogador } from '../../../lib/playerColors.ts'

export interface DonutItem {
  usuarioId: string
  nome: string
  percentual: number
  detalhe: string
}

interface Props {
  data: DonutItem[]
}

const COR_RESTO = '#9c94a3' // --color-locked

function Donut({ item, indice }: { item: DonutItem; indice: number }) {
  const cor = corDoJogador(item.nome, indice)
  const percentualArredondado = Math.round(item.percentual)
  const fatias = [
    { nome: 'preenchido', valor: item.percentual },
    { nome: 'resto', valor: 100 - item.percentual },
  ]

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-28 w-28">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={fatias} dataKey="valor" innerRadius={38} outerRadius={52} startAngle={90} endAngle={-270} stroke="none">
              <Cell fill={cor} />
              <Cell fill={COR_RESTO} fillOpacity={0.35} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-lg font-bold tabular-nums text-text">{percentualArredondado}%</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-text">{item.nome}</p>
        <p className="text-xs text-muted">{item.detalhe}</p>
      </div>
    </div>
  )
}

export function AccuracyDonutChart({ data }: Props) {
  if (data.length === 0) {
    return <p className="text-muted text-center py-8 text-sm">Ainda não há palpites suficientes.</p>
  }

  return (
    <div className="flex flex-wrap justify-center gap-6">
      {data.map((item, idx) => (
        <Donut key={item.usuarioId} item={item} indice={idx} />
      ))}
    </div>
  )
}
