import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SIGLAS: Array<{ id: number; sigla: string }> = [
  { id: 1,  sigla: 'MEX' }, { id: 2,  sigla: 'AFS' }, { id: 3,  sigla: 'COR' }, { id: 4,  sigla: 'TCH' },
  { id: 5,  sigla: 'CAN' }, { id: 6,  sigla: 'BOS' }, { id: 7,  sigla: 'QAT' }, { id: 8,  sigla: 'SUI' },
  { id: 9,  sigla: 'HAI' }, { id: 10, sigla: 'ESC' }, { id: 11, sigla: 'BRA' }, { id: 12, sigla: 'MAR' },
  { id: 13, sigla: 'EUA' }, { id: 14, sigla: 'PAR' }, { id: 15, sigla: 'AUS' }, { id: 16, sigla: 'TUR' },
  { id: 17, sigla: 'CDM' }, { id: 18, sigla: 'EQU' }, { id: 19, sigla: 'ALE' }, { id: 20, sigla: 'CUR' },
  { id: 21, sigla: 'HOL' }, { id: 22, sigla: 'JAP' }, { id: 23, sigla: 'SUE' }, { id: 24, sigla: 'TUN' },
  { id: 25, sigla: 'IRA' }, { id: 26, sigla: 'NZL' }, { id: 27, sigla: 'BEL' }, { id: 28, sigla: 'EGI' },
  { id: 29, sigla: 'SAU' }, { id: 30, sigla: 'URU' }, { id: 31, sigla: 'ESP' }, { id: 32, sigla: 'CAB' },
  { id: 33, sigla: 'FRA' }, { id: 34, sigla: 'SEN' }, { id: 35, sigla: 'IRQ' }, { id: 36, sigla: 'NOR' },
  { id: 37, sigla: 'ARG' }, { id: 38, sigla: 'ALG' }, { id: 39, sigla: 'AUT' }, { id: 40, sigla: 'JOR' },
  { id: 41, sigla: 'POR' }, { id: 42, sigla: 'CDR' }, { id: 43, sigla: 'UZB' }, { id: 44, sigla: 'COL' },
  { id: 45, sigla: 'GAN' }, { id: 46, sigla: 'PAN' }, { id: 47, sigla: 'ING' }, { id: 48, sigla: 'CRO' },
]

async function run() {
  console.log('→ Atualizando siglas das equipes...')
  for (const { id, sigla } of SIGLAS) {
    await prisma.equipe.update({ where: { id }, data: { sigla } })
  }
  console.log(`  ✓ ${SIGLAS.length} siglas atualizadas`)
}

run()
  .catch((err) => { console.error(err); process.exit(1) })
  .finally(() => prisma.$disconnect())
