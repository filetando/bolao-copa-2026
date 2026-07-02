// Carrega docs/architecture/bracket_dependencias.json (mapa "quem alimenta quem" dos jogos
// 89-104) — I/O de arquivo fica na infrastructure, domain nunca lê arquivos (ARCHITECTURE.md §1).
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import type { DependenciaJogo } from '../../domain/tournament/BracketPropagationService.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

export function loadBracketDependencias(): Record<string, DependenciaJogo> {
  const path = resolve(__dirname, '../../../docs/architecture/bracket_dependencias.json')
  return JSON.parse(readFileSync(path, 'utf-8')) as Record<string, DependenciaJogo>
}
