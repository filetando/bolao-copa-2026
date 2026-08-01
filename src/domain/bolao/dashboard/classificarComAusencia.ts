// Não apostar conta como errar (0 pontos) — regra confirmada pelo dono do bolão, válida em
// todo o dashboard (perfil de acerto, contrafactual, recordes). Centraliza a checagem de
// ausência de palpite num único lugar, em vez de repetir `=== null` em cada função de domínio.
import { RegraPontuacao, type CategoriaPalpite } from '../RegraPontuacao.js'
import type { DetalhePalpiteRow } from './DetalhePalpiteRow.js'

export function classificarComAusencia(row: DetalhePalpiteRow): CategoriaPalpite {
  if (row.golsCasaPalpite === null || row.golsForaPalpite === null) return 'erro'

  return RegraPontuacao.classificar(
    { golsCasa: row.golsCasaPalpite, golsFora: row.golsForaPalpite },
    { golsCasa: row.golsCasa, golsFora: row.golsFora },
  )
}
