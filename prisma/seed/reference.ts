import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const prisma = new PrismaClient()

// DOMAIN_RULES.md §8 — multiplicadores por fase
const FASES = [
  { id: 'grupos',         nomeExibicao: 'Fase de Grupos',   multiplicador: 1.0, ordem: 1 },
  { id: '16avos',         nomeExibicao: '16-Avos de Final', multiplicador: 1.5, ordem: 2 },
  { id: 'oitavas',        nomeExibicao: 'Oitavas de Final', multiplicador: 1.5, ordem: 3 },
  { id: 'quartas',        nomeExibicao: 'Quartas de Final', multiplicador: 2.0, ordem: 4 },
  { id: 'semifinal',      nomeExibicao: 'Semifinais',       multiplicador: 2.0, ordem: 5 },
  { id: 'terceiro_lugar', nomeExibicao: 'Terceiro Lugar',   multiplicador: 2.0, ordem: 6 },
  { id: 'final',          nomeExibicao: 'Final',            multiplicador: 4.0, ordem: 7 },
] as const

export async function seedReference() {
  console.log('→ Seeding fases...')
  for (const fase of FASES) {
    await prisma.fase.upsert({
      where: { id: fase.id },
      create: fase,
      update: fase,
    })
  }
  console.log(`  ✓ ${FASES.length} fases`)

  console.log('→ Seeding confrontos_terceiros (Anexo C)...')
  const raw = readFileSync(
    join(__dirname, '../../docs/architecture/confrontos_terceiros.json'),
    'utf-8',
  )
  const confrontosObj = JSON.parse(raw) as Record<string, Record<string, string>>

  const confrontos = Object.entries(confrontosObj).map(([combinacao, vals]) => ({
    combinacao,
    vs1a: vals['vs_1a'],
    vs1b: vals['vs_1b'],
    vs1d: vals['vs_1d'],
    vs1e: vals['vs_1e'],
    vs1g: vals['vs_1g'],
    vs1i: vals['vs_1i'],
    vs1k: vals['vs_1k'],
    vs1l: vals['vs_1l'],
  }))

  await prisma.confrontoTerceiro.createMany({ data: confrontos, skipDuplicates: true })
  console.log(`  ✓ ${confrontos.length} confrontos_terceiros`)
}

// Executar diretamente: tsx prisma/seed/reference.ts
const isMain = process.argv[1] === fileURLToPath(import.meta.url)
if (isMain) {
  seedReference()
    .catch((err) => { console.error(err); process.exit(1) })
    .finally(() => prisma.$disconnect())
}
