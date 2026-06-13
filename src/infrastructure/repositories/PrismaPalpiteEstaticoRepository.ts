import type { PrismaClient } from '@prisma/client'
import type { PalpiteEstaticoRepository, PalpiteEstaticoData } from '../../application/bolao/ports/PalpiteEstaticoRepository.js'

export class PrismaPalpiteEstaticoRepository implements PalpiteEstaticoRepository {
  constructor(private readonly db: PrismaClient) {}

  async upsert(data: {
    usuarioId: string
    mercado: string
    valorEquipeId: number | null
    valorTexto: string | null
  }): Promise<PalpiteEstaticoData> {
    const row = await this.db.palpiteEstatico.upsert({
      where: { usuarioId_mercado: { usuarioId: data.usuarioId, mercado: data.mercado } },
      create: {
        usuarioId: data.usuarioId,
        mercado: data.mercado,
        valorEquipeId: data.valorEquipeId,
        valorTexto: data.valorTexto,
      },
      update: {
        valorEquipeId: data.valorEquipeId,
        valorTexto: data.valorTexto,
      },
    })
    return this.toData(row)
  }

  async findByUsuario(usuarioId: string): Promise<PalpiteEstaticoData[]> {
    const rows = await this.db.palpiteEstatico.findMany({
      where: { usuarioId },
      orderBy: { mercado: 'asc' },
    })
    return rows.map((r) => this.toData(r))
  }

  private toData(row: {
    id: string
    usuarioId: string
    mercado: string
    valorEquipeId: number | null
    valorTexto: string | null
    pontosObtidos: number | null
    travadoEm: Date
  }): PalpiteEstaticoData {
    return {
      id: row.id,
      usuarioId: row.usuarioId,
      mercado: row.mercado,
      valorEquipeId: row.valorEquipeId,
      valorTexto: row.valorTexto,
      pontosObtidos: row.pontosObtidos,
      travadoEm: row.travadoEm,
    }
  }
}
