// Carrega seed-data/partidas_fase_grupos.json e expõe partidaId → rodada da fase de grupos
// (R1/R2/R3). Esse rótulo existe só no arquivo de seed — o Prisma model `Partida` não tem
// coluna `rodada` — então é tratado como dado estático de referência, no mesmo padrão de
// loadAnexoCTable.ts. Usado só pelo card "rodada mais pontuada" do dashboard.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import type { RodadaGrupo } from '../../domain/bolao/dashboard/Recordes.js'

interface PartidaGrupoSeedRow {
  id: number
  rodada: string
}

const __dirname = dirname(fileURLToPath(import.meta.url))

// "Abertura" identifica os 2 jogos de abertura do torneio — ainda fazem parte da 1ª rodada.
function normalizarRodada(rodada: string): RodadaGrupo {
  if (rodada === 'Abertura') return 'R1'
  if (rodada === 'R1' || rodada === 'R2' || rodada === 'R3') return rodada
  throw new Error(`Rodada de grupo desconhecida no seed: "${rodada}"`)
}

export function loadRodadasGrupos(): Record<number, RodadaGrupo> {
  const path = resolve(__dirname, '../../../seed-data/partidas_fase_grupos.json')
  const raw = JSON.parse(readFileSync(path, 'utf-8')) as PartidaGrupoSeedRow[]

  return Object.fromEntries(raw.map((row) => [row.id, normalizarRodada(row.rodada)]))
}
