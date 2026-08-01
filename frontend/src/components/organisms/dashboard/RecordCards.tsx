import type { Recordes } from '../../../types/index.ts'

interface Props {
  data: Recordes
}

function nomesNoTopo(lista: { nome: string; quantidade: number }[]): string {
  if (lista.length === 0) return '—'
  const max = lista[0].quantidade
  return lista
    .filter((r) => r.quantidade === max)
    .map((r) => r.nome)
    .join(' e ')
}

interface CardProps {
  rotulo: string
  valor: string
  detalhe: string
}

function Card({ rotulo, valor, detalhe }: CardProps) {
  return (
    <div className="bg-surface rounded-[12px] border border-border p-4 flex flex-col gap-1">
      <p className="text-xs text-muted">{rotulo}</p>
      <p className="font-mono text-2xl font-bold tabular-nums text-text">{valor}</p>
      <p className="text-xs text-muted">{detalhe}</p>
    </div>
  )
}

export function RecordCards({ data }: Props) {
  const maxExatos = data.maisPlacaresExatos[0]?.quantidade ?? 0
  const maxSequencia = data.maiorSequenciaDeAcertos[0]?.quantidade ?? 0

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Card
        rotulo="Mais placares exatos"
        valor={String(maxExatos)}
        detalhe={nomesNoTopo(data.maisPlacaresExatos)}
      />
      <Card
        rotulo="Maior sequência de acertos"
        valor={String(maxSequencia)}
        detalhe={`${nomesNoTopo(data.maiorSequenciaDeAcertos)} seguidos`}
      />
      <Card
        rotulo="Rodada mais pontuada"
        valor={data.rodadaMaisPontuada ? `${data.rodadaMaisPontuada.totalPontos} pts` : '—'}
        detalhe={data.rodadaMaisPontuada?.rotulo ?? 'sem dados'}
      />
      <Card
        rotulo="O jogo que todo mundo errou"
        valor={
          data.jogoQueTodosErraram && data.jogoQueTodosErraram.equipeCasaSigla && data.jogoQueTodosErraram.equipeForaSigla
            ? `${data.jogoQueTodosErraram.equipeCasaSigla} x ${data.jogoQueTodosErraram.equipeForaSigla}`
            : '—'
        }
        detalhe={
          data.jogoQueTodosErraram
            ? `${data.jogoQueTodosErraram.faseNomeExibicao} · ×${data.jogoQueTodosErraram.multiplicador}${
                data.jogoQueTodosErraram.totalDeJogosAssim > 1
                  ? ` · ${data.jogoQueTodosErraram.totalDeJogosAssim} jogos assim`
                  : ''
              }`
            : 'ninguém errou tudo'
        }
      />
    </div>
  )
}
