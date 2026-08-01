import { useMemo, useState } from 'react'
import type { LeaderboardHistoryResponse } from '../../../types/index.ts'
import { corDoJogador } from '../../../lib/playerColors.ts'

interface Props {
  data: LeaderboardHistoryResponse
}

interface Segmento {
  usuarioId: string
  nome: string
  largura: number
  inicio: string
  fim: string
}

// Líder acumulado em cada data do histórico — em caso de empate, mantém quem já liderava
// (evita "flicker" de cor por empates técnicos de um dia).
function calcularSegmentos(data: LeaderboardHistoryResponse): Segmento[] {
  if (data.pontos.length === 0) return []

  const segmentos: Segmento[] = []
  let liderAtualId: string | null = null

  for (const ponto of data.pontos) {
    let liderId = liderAtualId
    let maiorPontuacao = liderId ? ponto.pontosPorUsuario[liderId] : -Infinity

    for (const usuario of data.usuarios) {
      const pontos = ponto.pontosPorUsuario[usuario.usuarioId] ?? 0
      if (pontos > maiorPontuacao) {
        maiorPontuacao = pontos
        liderId = usuario.usuarioId
      }
    }

    const nome = data.usuarios.find((u) => u.usuarioId === liderId)?.nome ?? ''

    if (segmentos.length > 0 && segmentos[segmentos.length - 1].usuarioId === liderId) {
      segmentos[segmentos.length - 1].largura++
      segmentos[segmentos.length - 1].fim = ponto.dataHoraUtc
    } else {
      segmentos.push({ usuarioId: liderId!, nome, largura: 1, inicio: ponto.dataHoraUtc, fim: ponto.dataHoraUtc })
    }

    liderAtualId = liderId
  }

  return segmentos
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export function LeadershipStrip({ data }: Props) {
  const segmentos = useMemo(() => calcularSegmentos(data), [data])
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  if (segmentos.length === 0) return null

  const totalPontos = data.pontos.length
  const trocas = new Set(segmentos.map((s) => s.usuarioId)).size > 1 ? segmentos.length - 1 : 0

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-muted">Quem estava em 1º</p>
        <p className="text-xs text-muted">
          {trocas === 0 ? 'liderança sem troca' : `liderança trocou de mãos ${trocas}x`}
        </p>
      </div>
      <div className="flex h-3 w-full overflow-hidden rounded-full" role="img" aria-label="Faixa de liderança ao longo do torneio">
        {segmentos.map((seg, idx) => {
          const nomes = data.usuarios.map((u) => u.nome)
          const idxNome = nomes.indexOf(seg.nome)
          return (
            <div
              key={idx}
              className="h-full transition-opacity"
              style={{
                width: `${(seg.largura / totalPontos) * 100}%`,
                backgroundColor: corDoJogador(seg.nome, idxNome),
                opacity: hoverIdx === null || hoverIdx === idx ? 1 : 0.35,
              }}
              onMouseEnter={() => setHoverIdx(idx)}
              onMouseLeave={() => setHoverIdx(null)}
              title={`${seg.nome}: ${formatDate(seg.inicio)} – ${formatDate(seg.fim)}`}
            />
          )
        })}
      </div>
    </div>
  )
}
