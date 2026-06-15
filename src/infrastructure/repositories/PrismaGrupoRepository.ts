import type { PrismaClient } from '@prisma/client'
import type { GrupoRepository, GrupoComPartidas } from '../../application/tournament/ports/GrupoRepository.js'

export class PrismaGrupoRepository implements GrupoRepository {
  constructor(private readonly db: PrismaClient) {}

  async findGrupoComPartidasEncerradas(grupoId: string): Promise<GrupoComPartidas | null> {
    const grupo = await this.db.grupo.findUnique({
      where: { id: grupoId },
      include: {
        equipes: {
          select: { id: true, nome: true, sigla: true, bandeiraCodigo: true },
        },
        partidas: {
          where: {
            status: 'encerrada',
            equipeCasaId: { not: null },
            equipeForaId: { not: null },
          },
          select: { equipeCasaId: true, equipeForaId: true, golsCasa: true, golsFora: true },
        },
      },
    })
    if (!grupo) return null

    return {
      equipes: grupo.equipes,
      partidas: grupo.partidas
        .filter((p) => p.golsCasa !== null && p.golsFora !== null)
        .map((p) => ({
          equipeCasaId: p.equipeCasaId!,
          equipeForaId: p.equipeForaId!,
          golsCasa: p.golsCasa!,
          golsFora: p.golsFora!,
        })),
    }
  }
}
