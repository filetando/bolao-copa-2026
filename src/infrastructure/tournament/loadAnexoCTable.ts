// Carrega docs/architecture/confrontos_terceiros.json (495 combinações, Anexo C FIFA) e
// converte para o formato camelCase consumido por AnexoCLookup (domain). I/O de arquivo fica
// aqui na infrastructure — domain nunca lê arquivos (ARCHITECTURE.md §1).
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import type { ConfrontoTerceiro } from '../../domain/tournament/AnexoCLookup.js'

interface ConfrontoRowSnakeCase {
  vs_1a: string
  vs_1b: string
  vs_1d: string
  vs_1e: string
  vs_1g: string
  vs_1i: string
  vs_1k: string
  vs_1l: string
}

const __dirname = dirname(fileURLToPath(import.meta.url))

export function loadAnexoCTable(): Record<string, ConfrontoTerceiro> {
  const path = resolve(__dirname, '../../../docs/architecture/confrontos_terceiros.json')
  const raw = JSON.parse(readFileSync(path, 'utf-8')) as Record<string, ConfrontoRowSnakeCase>

  return Object.fromEntries(
    Object.entries(raw).map(([combinacao, row]) => [
      combinacao,
      {
        vs1a: row.vs_1a,
        vs1b: row.vs_1b,
        vs1d: row.vs_1d,
        vs1e: row.vs_1e,
        vs1g: row.vs_1g,
        vs1i: row.vs_1i,
        vs1k: row.vs_1k,
        vs1l: row.vs_1l,
      },
    ]),
  )
}
