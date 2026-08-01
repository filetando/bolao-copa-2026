import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { CategoriaPerfil, PerfilAcertoUsuario } from '../../../types/index.ts'
import { COR_CATEGORIA, ORDEM_CATEGORIAS, ROTULO_CATEGORIA } from '../../../lib/categoriaColors.ts'

interface Props {
  data: PerfilAcertoUsuario[]
}

const COR_GRID = '#e7ded2'
const COR_EIXO = '#6b6275'

interface TooltipPayloadEntry {
  dataKey: string
  value?: number
  color?: string
  payload: Record<string, unknown>
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipPayloadEntry[]
  label?: unknown
}) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div style={{ borderRadius: 12, border: `1px solid ${COR_GRID}`, fontSize: 12, background: '#fff', padding: '8px 12px' }}>
      <p style={{ marginBottom: 4, fontWeight: 600 }}>{String(label)}</p>
      {[...payload].reverse().map((entry) => {
        const quantidade = (entry.payload[`${entry.dataKey}_quantidade`] as number | undefined) ?? 0
        return (
          <div key={entry.dataKey} style={{ color: entry.color }}>
            {ROTULO_CATEGORIA[entry.dataKey as keyof typeof ROTULO_CATEGORIA]}: {quantidade} (
            {(entry.value ?? 0).toFixed(0)}%)
          </div>
        )
      })}
    </div>
  )
}

export function AccuracyProfileChart({ data }: Props) {
  if (data.length === 0) {
    return <p className="text-muted text-center py-8 text-sm">Ainda não há palpites suficientes para o perfil.</p>
  }

  const chartData = data.map((usuario) => {
    const linha: Record<string, string | number> = { nome: usuario.nome }
    for (const categoria of ORDEM_CATEGORIAS) {
      linha[categoria] = usuario.categorias[categoria].percentual
      linha[`${categoria}_quantidade`] = usuario.categorias[categoria].quantidade
    }
    return linha
  })

  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 64)}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 16, left: 0, bottom: 0 }} barSize={28}>
        <CartesianGrid strokeDasharray="3 3" stroke={COR_GRID} horizontal={false} />
        <XAxis
          type="number"
          domain={[0, 100]}
          tickFormatter={(v) => `${Math.round(v)}%`}
          tick={{ fontSize: 11, fill: COR_EIXO }}
          axisLine={{ stroke: COR_GRID }}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="nome"
          tick={{ fontSize: 12, fill: COR_EIXO }}
          axisLine={false}
          tickLine={false}
          width={90}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
        <Legend
          wrapperStyle={{ fontSize: 11 }}
          itemSorter={(item) => ORDEM_CATEGORIAS.indexOf(item.dataKey as CategoriaPerfil)}
        />
        {ORDEM_CATEGORIAS.map((categoria) => {
          if (categoria === 'nao_palpitou') {
            return (
              <Bar
                key={categoria}
                dataKey={categoria}
                name={ROTULO_CATEGORIA[categoria]}
                stackId="perfil"
                fill={COR_CATEGORIA.nao_palpitou}
                fillOpacity={0.12}
                stroke={COR_CATEGORIA.nao_palpitou}
                strokeDasharray="3 2"
                strokeWidth={1}
              />
            )
          }
          if (categoria === 'erro') {
            return (
              <Bar
                key={categoria}
                dataKey={categoria}
                name={ROTULO_CATEGORIA[categoria]}
                stackId="perfil"
                fill={COR_CATEGORIA.erro}
                fillOpacity={0.35}
                stroke={COR_CATEGORIA.erro}
                strokeWidth={1}
              />
            )
          }
          return (
            <Bar
              key={categoria}
              dataKey={categoria}
              name={ROTULO_CATEGORIA[categoria]}
              stackId="perfil"
              fill={COR_CATEGORIA[categoria]}
            />
          )
        })}
      </BarChart>
    </ResponsiveContainer>
  )
}
