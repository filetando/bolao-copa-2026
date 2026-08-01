import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { PontosPorFaseUsuario } from '../../../types/index.ts'
import { corDoJogador } from '../../../lib/playerColors.ts'

interface Props {
  data: PontosPorFaseUsuario[]
}

const COR_GRID = '#e7ded2'
const COR_EIXO = '#6b6275'

function pivotarPorFase(data: PontosPorFaseUsuario[]) {
  const porFase = new Map<string, { faseNomeExibicao: string; faseOrdem: number; linha: Record<string, string | number> }>()

  for (const usuario of data) {
    for (const fase of usuario.fases) {
      if (!porFase.has(fase.faseId)) {
        porFase.set(fase.faseId, {
          faseNomeExibicao: fase.faseNomeExibicao,
          faseOrdem: fase.faseOrdem,
          linha: { fase: fase.faseNomeExibicao },
        })
      }
      porFase.get(fase.faseId)!.linha[usuario.nome] = fase.pontos
    }
  }

  return [...porFase.values()].sort((a, b) => a.faseOrdem - b.faseOrdem).map((f) => f.linha)
}

export function PointsByPhaseChart({ data }: Props) {
  if (data.length === 0) {
    return <p className="text-muted text-center py-8 text-sm">Ainda não há partidas encerradas.</p>
  }

  const chartData = pivotarPorFase(data)

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
        <YAxis tick={{ fontSize: 11, fill: COR_EIXO }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: `1px solid ${COR_GRID}`, fontSize: 12 }}
          cursor={{ fill: 'rgba(0,0,0,0.03)' }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {data.map((usuario, idx) => (
          <Bar key={usuario.usuarioId} dataKey={usuario.nome} name={usuario.nome} stackId="fase" fill={corDoJogador(usuario.nome, idx)} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
