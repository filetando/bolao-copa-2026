import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const prisma = new PrismaClient()

// ─── Grupos A-L ──────────────────────────────────────────────────────────────

const GRUPOS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

// ─── grupo_simultaneo_id para partidas R3 ────────────────────────────────────
// DOMAIN_RULES.md §10 — R3 de cada grupo são simultâneas; corte = menor horário do conjunto
// IDs 1-12 reservados para R3 de grupos (A=1, B=2, ..., L=12)
const GRUPO_SIMULTANEO_GRUPO: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6,
  G: 7, H: 8, I: 9, J: 10, K: 11, L: 12,
}

// ─── Mata-mata: grupo_simultaneo_id ──────────────────────────────────────────
// IDs 101+ para conjuntos simultâneos do mata-mata
// Jogos 75 e 76: 29/06 21h00 ET (mesma hora → simultâneos)
// Jogos 80-82: 02/07 "várias partidas simultâneas" (bolao-copa-2026_1.md §9)
const SIMULTANEO_75_76 = 101
const SIMULTANEO_80_82 = 102

// ─── Mata-mata: dados das partidas 73-104 ────────────────────────────────────
// Horários de bolao-copa-2026_1.md §9. Conversão: UTC = ET + 4h (ADR-005)
// Jogos 80-85: datas provisórias (lacuna na fonte) — MARCO_1_PLAN.md, Tarefa 1
type PartidaMata = {
  id: number
  faseId: string
  placeholderCasa: string
  placeholderFora: string
  dataHoraUtc: string
  estadio: string | null
  cidade: string | null
  grupoSimultaneoId: number | null
}

const PARTIDAS_MATA_MATA: PartidaMata[] = [
  // 16-Avos de Final (jogos 73-88) — fase_id: '16avos'
  { id: 73,  faseId: '16avos', placeholderCasa: '2º Grupo A',              placeholderFora: '2º Grupo B',              dataHoraUtc: '2026-06-29T02:00:00Z', estadio: 'SoFi Stadium',           cidade: 'Los Angeles',      grupoSimultaneoId: null         },
  { id: 74,  faseId: '16avos', placeholderCasa: '1º Grupo E',              placeholderFora: 'Melhor 3º (A/B/C/D/F)',   dataHoraUtc: '2026-06-29T20:00:00Z', estadio: 'Gillette Stadium',       cidade: 'Boston',           grupoSimultaneoId: null         },
  { id: 75,  faseId: '16avos', placeholderCasa: '1º Grupo F',              placeholderFora: '2º Grupo C',              dataHoraUtc: '2026-06-30T01:00:00Z', estadio: 'Estadio BBVA',           cidade: 'Monterrey',        grupoSimultaneoId: SIMULTANEO_75_76 },
  { id: 76,  faseId: '16avos', placeholderCasa: '1º Grupo C',              placeholderFora: '2º Grupo F',              dataHoraUtc: '2026-06-30T01:00:00Z', estadio: 'NRG Stadium',            cidade: 'Houston',          grupoSimultaneoId: SIMULTANEO_75_76 },
  { id: 77,  faseId: '16avos', placeholderCasa: '1º Grupo I',              placeholderFora: 'Melhor 3º (C/D/F/G/H)',   dataHoraUtc: '2026-06-30T20:00:00Z', estadio: 'MetLife Stadium',        cidade: 'Nova Jersey',      grupoSimultaneoId: null         },
  { id: 78,  faseId: '16avos', placeholderCasa: '2º Grupo E',              placeholderFora: '2º Grupo I',              dataHoraUtc: '2026-06-30T22:00:00Z', estadio: 'AT&T Stadium',           cidade: 'Dallas',           grupoSimultaneoId: null         },
  { id: 79,  faseId: '16avos', placeholderCasa: '1º Grupo A',              placeholderFora: 'Melhor 3º (C/E/F/H/I)',   dataHoraUtc: '2026-07-01T01:00:00Z', estadio: 'Estádio Azteca',         cidade: 'Cidade do México', grupoSimultaneoId: null         },
  // Jogos 80-85: datas provisórias (lacuna na fonte — ajustar quando oficial)
  { id: 80,  faseId: '16avos', placeholderCasa: '1º Grupo L',              placeholderFora: 'Melhor 3º (E/H/I/J/K)',   dataHoraUtc: '2026-07-02T12:00:00Z', estadio: null,                     cidade: null,               grupoSimultaneoId: SIMULTANEO_80_82 },
  { id: 81,  faseId: '16avos', placeholderCasa: '1º Grupo D',              placeholderFora: 'Melhor 3º (B/E/F/I/J)',   dataHoraUtc: '2026-07-02T12:00:00Z', estadio: null,                     cidade: null,               grupoSimultaneoId: SIMULTANEO_80_82 },
  { id: 82,  faseId: '16avos', placeholderCasa: '1º Grupo G',              placeholderFora: 'Melhor 3º (A/E/H/I/J)',   dataHoraUtc: '2026-07-02T12:00:00Z', estadio: null,                     cidade: null,               grupoSimultaneoId: SIMULTANEO_80_82 },
  { id: 83,  faseId: '16avos', placeholderCasa: '2º Grupo K',              placeholderFora: '2º Grupo L',              dataHoraUtc: '2026-07-02T12:00:00Z', estadio: null,                     cidade: null,               grupoSimultaneoId: null         },
  { id: 84,  faseId: '16avos', placeholderCasa: '1º Grupo H',              placeholderFora: '2º Grupo J',              dataHoraUtc: '2026-07-02T12:00:00Z', estadio: null,                     cidade: null,               grupoSimultaneoId: null         },
  { id: 85,  faseId: '16avos', placeholderCasa: '1º Grupo B',              placeholderFora: 'Melhor 3º (E/F/G/I/J)',   dataHoraUtc: '2026-07-02T12:00:00Z', estadio: null,                     cidade: null,               grupoSimultaneoId: null         },
  { id: 86,  faseId: '16avos', placeholderCasa: '1º Grupo J',              placeholderFora: '2º Grupo H',              dataHoraUtc: '2026-07-03T19:00:00Z', estadio: 'Hard Rock Stadium',      cidade: 'Miami',            grupoSimultaneoId: null         },
  { id: 87,  faseId: '16avos', placeholderCasa: '1º Grupo K',              placeholderFora: 'Melhor 3º (D/E/I/J/L)',   dataHoraUtc: '2026-07-03T22:00:00Z', estadio: 'Arrowhead Stadium',      cidade: 'Kansas City',      grupoSimultaneoId: null         },
  { id: 88,  faseId: '16avos', placeholderCasa: '2º Grupo D',              placeholderFora: '2º Grupo G',              dataHoraUtc: '2026-07-04T01:00:00Z', estadio: 'AT&T Stadium',           cidade: 'Dallas',           grupoSimultaneoId: null         },

  // Oitavas de Final (jogos 89-96) — fase_id: 'oitavas'
  { id: 89,  faseId: 'oitavas', placeholderCasa: 'Venc. Jogo 74',          placeholderFora: 'Venc. Jogo 77',           dataHoraUtc: '2026-07-04T21:00:00Z', estadio: 'Lincoln Financial Field', cidade: 'Filadélfia',       grupoSimultaneoId: null         },
  { id: 90,  faseId: 'oitavas', placeholderCasa: 'Venc. Jogo 73',          placeholderFora: 'Venc. Jogo 75',           dataHoraUtc: '2026-07-05T00:00:00Z', estadio: 'NRG Stadium',            cidade: 'Houston',          grupoSimultaneoId: null         },
  { id: 91,  faseId: 'oitavas', placeholderCasa: 'Venc. Jogo 76',          placeholderFora: 'Venc. Jogo 78',           dataHoraUtc: '2026-07-05T20:00:00Z', estadio: 'MetLife Stadium',        cidade: 'Nova Jersey',      grupoSimultaneoId: null         },
  { id: 92,  faseId: 'oitavas', placeholderCasa: 'Venc. Jogo 79',          placeholderFora: 'Venc. Jogo 80',           dataHoraUtc: '2026-07-06T01:00:00Z', estadio: 'Estádio Azteca',         cidade: 'Cidade do México', grupoSimultaneoId: null         },
  { id: 93,  faseId: 'oitavas', placeholderCasa: 'Venc. Jogo 83',          placeholderFora: 'Venc. Jogo 84',           dataHoraUtc: '2026-07-06T20:00:00Z', estadio: 'AT&T Stadium',           cidade: 'Dallas',           grupoSimultaneoId: null         },
  { id: 94,  faseId: 'oitavas', placeholderCasa: 'Venc. Jogo 81',          placeholderFora: 'Venc. Jogo 82',           dataHoraUtc: '2026-07-07T01:00:00Z', estadio: 'Lumen Field',            cidade: 'Seattle',          grupoSimultaneoId: null         },
  { id: 95,  faseId: 'oitavas', placeholderCasa: 'Venc. Jogo 86',          placeholderFora: 'Venc. Jogo 88',           dataHoraUtc: '2026-07-07T17:00:00Z', estadio: 'Mercedes-Benz Stadium',  cidade: 'Atlanta',          grupoSimultaneoId: null         },
  { id: 96,  faseId: 'oitavas', placeholderCasa: 'Venc. Jogo 85',          placeholderFora: 'Venc. Jogo 87',           dataHoraUtc: '2026-07-07T21:00:00Z', estadio: 'BC Place',               cidade: 'Vancouver',        grupoSimultaneoId: null         },

  // Quartas de Final (jogos 97-100) — fase_id: 'quartas'
  { id: 97,  faseId: 'quartas', placeholderCasa: 'Venc. Jogo 89',          placeholderFora: 'Venc. Jogo 90',           dataHoraUtc: '2026-07-09T21:00:00Z', estadio: 'Gillette Stadium',       cidade: 'Boston',           grupoSimultaneoId: null         },
  { id: 98,  faseId: 'quartas', placeholderCasa: 'Venc. Jogo 93',          placeholderFora: 'Venc. Jogo 94',           dataHoraUtc: '2026-07-11T01:00:00Z', estadio: 'SoFi Stadium',           cidade: 'Los Angeles',      grupoSimultaneoId: null         },
  { id: 99,  faseId: 'quartas', placeholderCasa: 'Venc. Jogo 91',          placeholderFora: 'Venc. Jogo 92',           dataHoraUtc: '2026-07-11T22:00:00Z', estadio: 'Hard Rock Stadium',      cidade: 'Miami',            grupoSimultaneoId: null         },
  { id: 100, faseId: 'quartas', placeholderCasa: 'Venc. Jogo 95',          placeholderFora: 'Venc. Jogo 96',           dataHoraUtc: '2026-07-12T01:00:00Z', estadio: 'Arrowhead Stadium',      cidade: 'Kansas City',      grupoSimultaneoId: null         },

  // Semifinais (jogos 101-102) — fase_id: 'semifinal'
  { id: 101, faseId: 'semifinal',      placeholderCasa: 'Venc. Jogo 97',   placeholderFora: 'Venc. Jogo 98',           dataHoraUtc: '2026-07-14T19:00:00Z', estadio: 'AT&T Stadium',           cidade: 'Dallas',           grupoSimultaneoId: null         },
  { id: 102, faseId: 'semifinal',      placeholderCasa: 'Venc. Jogo 99',   placeholderFora: 'Venc. Jogo 100',          dataHoraUtc: '2026-07-15T19:00:00Z', estadio: 'Mercedes-Benz Stadium',  cidade: 'Atlanta',          grupoSimultaneoId: null         },

  // 3º Lugar e Final — fase_id: 'terceiro_lugar' / 'final'
  { id: 103, faseId: 'terceiro_lugar', placeholderCasa: 'Perd. Jogo 101',  placeholderFora: 'Perd. Jogo 102',          dataHoraUtc: '2026-07-18T19:00:00Z', estadio: 'Hard Rock Stadium',      cidade: 'Miami',            grupoSimultaneoId: null         },
  { id: 104, faseId: 'final',          placeholderCasa: 'Venc. Jogo 101',  placeholderFora: 'Venc. Jogo 102',          dataHoraUtc: '2026-07-19T19:00:00Z', estadio: 'MetLife Stadium',        cidade: 'Nova Jersey',      grupoSimultaneoId: null         },
]

// ─── Seed principal ───────────────────────────────────────────────────────────

export async function seedTournament() {
  // Grupos
  console.log('→ Seeding grupos...')
  await prisma.grupo.createMany({
    data: GRUPOS.map((id) => ({ id })),
    skipDuplicates: true,
  })
  console.log(`  ✓ ${GRUPOS.length} grupos`)

  // Equipes (seed-data/equipes.json)
  console.log('→ Seeding equipes...')
  const equipesRaw = JSON.parse(
    readFileSync(join(__dirname, '../../seed-data/equipes.json'), 'utf-8'),
  ) as Array<{
    id: number
    nome: string
    sigla: string
    bandeira_codigo: string
    grupo_id: string
  }>

  await prisma.equipe.createMany({
    data: equipesRaw.map((e) => ({
      id:             e.id,
      nome:           e.nome,
      sigla:          e.sigla,
      bandeiraCodigo: e.bandeira_codigo,
      grupoId:        e.grupo_id,
    })),
    skipDuplicates: true,
  })
  // Atualiza sequence após inserção com IDs explícitos
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('equipes', 'id'), (SELECT MAX(id) FROM equipes))`
  console.log(`  ✓ ${equipesRaw.length} equipes`)

  // Partidas fase de grupos (1-72) com grupo_simultaneo_id para R3
  console.log('→ Seeding partidas 1-72 (fase de grupos)...')
  const partidasGruposRaw = JSON.parse(
    readFileSync(join(__dirname, '../../seed-data/partidas_fase_grupos.json'), 'utf-8'),
  ) as Array<{
    id: number
    fase_id: string
    grupo_id: string
    equipe_casa_id: number | null
    equipe_fora_id: number | null
    placeholder_casa: string | null
    placeholder_fora: string | null
    gols_casa: number | null
    gols_fora: number | null
    status: string
    data_hora_utc: string
    estadio: string | null
    cidade: string | null
    rodada: string
  }>

  // Agrupa R3 por grupo_id para atribuir grupo_simultaneo_id (IDs 1-12)
  const r3ByGroup: Record<string, number[]> = {}
  for (const p of partidasGruposRaw.filter((p) => p.rodada === 'R3')) {
    if (!r3ByGroup[p.grupo_id]) r3ByGroup[p.grupo_id] = []
    r3ByGroup[p.grupo_id].push(p.id)
  }

  await prisma.partida.createMany({
    data: partidasGruposRaw.map((p) => {
      const isR3 = p.rodada === 'R3'
      const grupoSimultaneoId = isR3 ? (GRUPO_SIMULTANEO_GRUPO[p.grupo_id] ?? null) : null
      return {
        id:                p.id,
        faseId:            p.fase_id,
        grupoId:           p.grupo_id,
        equipeCasaId:      p.equipe_casa_id,
        equipeForaId:      p.equipe_fora_id,
        placeholderCasa:   p.placeholder_casa,
        placeholderFora:   p.placeholder_fora,
        golsCasa:          p.gols_casa,
        golsFora:          p.gols_fora,
        status:            p.status,
        dataHoraUtc:       new Date(p.data_hora_utc),
        estadio:           p.estadio,
        cidade:            p.cidade,
        grupoSimultaneoId,
      }
    }),
    skipDuplicates: true,
  })
  console.log(`  ✓ ${partidasGruposRaw.length} partidas (grupos)`)

  // Partidas mata-mata (73-104) com placeholders
  console.log('→ Seeding partidas 73-104 (mata-mata)...')
  await prisma.partida.createMany({
    data: PARTIDAS_MATA_MATA.map((p) => ({
      id:                p.id,
      faseId:            p.faseId,
      grupoId:           null,
      equipeCasaId:      null,
      equipeForaId:      null,
      placeholderCasa:   p.placeholderCasa,
      placeholderFora:   p.placeholderFora,
      golsCasa:          null,
      golsFora:          null,
      status:            'agendada',
      dataHoraUtc:       new Date(p.dataHoraUtc),
      estadio:           p.estadio,
      cidade:            p.cidade,
      grupoSimultaneoId: p.grupoSimultaneoId,
    })),
    skipDuplicates: true,
  })
  console.log(`  ✓ ${PARTIDAS_MATA_MATA.length} partidas (mata-mata)`)
}

// Executar diretamente: tsx prisma/seed/tournament.ts
const isMain = process.argv[1] === fileURLToPath(import.meta.url)
if (isMain) {
  seedTournament()
    .catch((err) => { console.error(err); process.exit(1) })
    .finally(() => prisma.$disconnect())
}
