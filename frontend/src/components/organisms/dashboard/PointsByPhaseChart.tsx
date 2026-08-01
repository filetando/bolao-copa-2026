import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { PontosPorFaseUsuario } from '../../../types/index.ts'
import { corDoJogador } from '../../../lib/playerColors.ts'

interface Props {
  data: PontosPorFaseUsuario[]
}

const COR_GRID = '#e7ded2'
const COR_EIXO = '#6b6275'

interface LinhaFase {
  fase: string
  rank0: number
  rank1: number
  rank2: number
  rank0Nome: string
  rank1Nome: string
  rank2Nome: string
  rank0Valor: number
  rank1Valor: number
  rank2Valor: number
}

// Empilhamento por diferença: ordena os jogadores do menor pro maior NAQUELA fase e cada
// posição só ocupa a diferença pro de baixo — a altura total da barra vira o valor do líder
// da fase (não a soma dos 3), e a cor de cada posição muda conforme quem lidera ali.
function pivotarPorFase(data: PontosPorFaseUsuario[]): LinhaFase[] {
  const porFase = new Map<string, { faseNomeExibicao: string; faseOrdem: number; valores: { nome: string; pontos: number }[] }>()

  for (const usuario of data) {
    for (const fase of usuario.fases) {
      if (!porFase.has(fase.faseId)) {
        porFase.set(fase.faseId, { faseNomeExibicao: fase.faseNomeExibicao, faseOrdem: fase.faseOrdem, valores: [] })
      }
      porFase.get(fase.faseId)!.valores.push({ nome: usuario.nome, pontos: fase.pontos })
    }
  }

  return [...porFase.values()]
    .sort((a, b) => a.faseOrdem - b.faseOrdem)
    .map(({ faseNomeExibicao, valores }) => {
      const ordenado = [...valores].sort((a, b) => a.pontos - b.pontos)
      const [menor, meio, maior] = ordenado

      return {
        fase: faseNomeExibicao,
        rank0: menor.pontos,
        rank1: meio.pontos - menor.pontos,
        rank2: maior.pontos - meio.pontos,
        rank0Nome: menor.nome,
        rank1Nome: meio.nome,
        rank2Nome: maior.nome,
        rank0Valor: menor.pontos,
        rank1Valor: meio.pontos,
        rank2Valor: maior.pontos,
      }
    })
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { payload: LinhaFase }[]; label?: unknown }) {
  if (!active || !payload || payload.length === 0) return null

  const linha = payload[0].payload
  const entradas = [
    { nome: linha.rank2Nome, valor: linha.rank2Valor },
    { nome: linha.rank1Nome, valor: linha.rank1Valor },
    { nome: linha.rank0Nome, valor: linha.rank0Valor },
  ]

  return (
    <div style={{ borderRadius: 12, border: `1px solid ${COR_GRID}`, fontSize: 12, background: '#fff', padding: '8px 12px' }}>
      <p style={{ marginBottom: 4, fontWeight: 600 }}>{String(label)}</p>
      {entradas.map((entrada, idx) => (
        <div key={entrada.nome} style={{ color: corDoJogador(entrada.nome, idx) }}>
          {entrada.nome}: {entrada.valor}
        </div>
      ))}
    </div>
  )
}

export function PointsByPhaseChart({ data }: Props) {
  if (data.length === 0) {
    return <p className="text-muted text-center py-8 text-sm">Ainda não há partidas encerradas.</p>
  }

  const chartData = pivotarPorFase(data)

  return (
    <div>
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
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
          <Bar dataKey="rank0" stackId="fase">
            {chartData.map((linha, idx) => (
              <Cell key={idx} fill={corDoJogador(linha.rank0Nome, 0)} />
            ))}
          </Bar>
          <Bar dataKey="rank1" stackId="fase">
            {chartData.map((linha, idx) => (
              <Cell key={idx} fill={corDoJogador(linha.rank1Nome, 1)} />
            ))}
          </Bar>
          <Bar dataKey="rank2" stackId="fase">
            {chartData.map((linha, idx) => (
              <Cell key={idx} fill={corDoJogador(linha.rank2Nome, 2)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {/* Legenda estática: a cor de cada posição na pilha muda por fase (quem lidera ali),
          então a legenda automática do Recharts (fixa por série) não faria sentido aqui. */}
      <div className="flex justify-center gap-4 mt-1">
        {data.map((usuario, idx) => (
          <div key={usuario.usuarioId} className="flex items-center gap-1.5 text-xs text-muted">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: corDoJogador(usuario.nome, idx) }} />
            {usuario.nome}
          </div>
        ))}
      </div>
    </div>
  )
}
