// DOMAIN_RULES.md §7/§8 — cascata de pontuação e multiplicadores por fase, exibidos em
// linguagem simples pra quem chega no Ranking sem contexto.
const CASCATA = [
  { rotulo: 'Placar exato', pontos: 25 },
  { rotulo: 'Vencedor + gols do vencedor', pontos: 18 },
  { rotulo: 'Vencedor + saldo de gols', pontos: 15 },
  { rotulo: 'Empate (sem ser o placar exato)', pontos: 15 },
  { rotulo: 'Vencedor', pontos: 10 },
]

const MULTIPLICADORES = [
  { rotulo: 'Fase de grupos', valor: '1x' },
  { rotulo: '16-avos + oitavas', valor: '1,5x' },
  { rotulo: 'Quartas + semi + 3º lugar', valor: '2x' },
  { rotulo: 'Final', valor: '4x' },
]

export function ScoringRulesCard() {
  return (
    <details className="bg-surface rounded-[12px] border border-border shadow-sm p-4 mb-6 open:pb-4">
      <summary className="text-sm font-semibold text-text cursor-pointer select-none">
        Como funciona a pontuação
      </summary>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <table className="w-full text-xs">
          <caption className="text-left text-muted mb-1 font-medium">Acerto → pontos (por jogo)</caption>
          <tbody>
            {CASCATA.map((linha) => (
              <tr key={linha.rotulo} className="border-t border-border">
                <td className="py-1.5 text-text">{linha.rotulo}</td>
                <td className="py-1.5 pl-2 text-right font-mono font-semibold tabular-nums text-text">
                  {linha.pontos}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <table className="w-full text-xs">
          <caption className="text-left text-muted mb-1 font-medium">Multiplicador por fase</caption>
          <tbody>
            {MULTIPLICADORES.map((linha) => (
              <tr key={linha.rotulo} className="border-t border-border">
                <td className="py-1.5 text-text">{linha.rotulo}</td>
                <td className="py-1.5 pl-2 text-right font-mono font-semibold tabular-nums text-primary">
                  {linha.valor}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted">Pontuação final = pontos do acerto × multiplicador da fase.</p>
    </details>
  )
}
