import { PrismaClient } from '@prisma/client'
import { seedReference } from './reference.js'
import { seedTournament } from './tournament.js'

const prisma = new PrismaClient()

async function main() {
  console.log('=== Seed: reference ===')
  await seedReference()
  console.log()
  console.log('=== Seed: tournament ===')
  await seedTournament()
  console.log()
  console.log('✓ Seed completo')
}

main()
  .catch((err) => { console.error(err); process.exit(1) })
  .finally(() => prisma.$disconnect())
