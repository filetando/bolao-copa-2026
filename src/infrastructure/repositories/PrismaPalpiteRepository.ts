import type { PrismaClient } from '@prisma/client'
import type { PalpiteRepository, PalpiteData, PalpiteWithUser } from '../../application/bolao/ports/PalpiteRepository.js'

export class PrismaPalpiteRepository implements PalpiteRepository {
  constructor(private readonly db: PrismaClient) {}

  async upsert(data: {
    usuarioId: string
    partidaId: number
    golsCasaPalpite: number
    golsForaPalpite: number
  }): Promise<PalpiteData> {
    const row = await this.db.palpite.upsert({
      where: { usuarioId_partidaId: { usuarioId: data.usuarioId, partidaId: data.partidaId } },
      create: {
        usuarioId: data.usuarioId,
        partidaId: data.partidaId,
        golsCasaPalpite: data.golsCasaPalpite,
        golsForaPalpite: data.golsForaPalpite,
      },
      update: {
        golsCasaPalpite: data.golsCasaPalpite,
        golsForaPalpite: data.golsForaPalpite,
      },
    })
    return this.toData(row)
  }

  async findByUsuario(usuarioId: string): Promise<PalpiteData[]> {
    const rows = await this.db.palpite.findMany({
      where: { usuarioId },
      orderBy: { partidaId: 'asc' },
    })
    return rows.map((r) => this.toData(r))
  }

  async findByPartida(partidaId: number): Promise<PalpiteWithUser[]> {
    const rows = await this.db.palpite.findMany({
      where: { partidaId },
      include: { usuario: { select: { nome: true } } },
    })
    return rows.map((r) => ({ ...this.toData(r), nomeUsuario: r.usuario.nome }))
  }

  private toData(row: {
    id: string
    usuarioId: string
    partidaId: number
    golsCasaPalpite: number
    golsForaPalpite: number
    pontosObtidos: number | null
    createdAt: Date
    updatedAt: Date
  }): PalpiteData {
    return {
      id: row.id,
      usuarioId: row.usuarioId,
      partidaId: row.partidaId,
      golsCasaPalpite: row.golsCasaPalpite,
      golsForaPalpite: row.golsForaPalpite,
      pontosObtidos: row.pontosObtidos,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }
}
