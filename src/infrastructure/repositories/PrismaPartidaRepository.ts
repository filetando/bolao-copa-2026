import type { PrismaClient } from '@prisma/client'
import type { PartidaRepository, PartidaListItem } from '../../application/tournament/ports/PartidaRepository.js'

export class PrismaPartidaRepository implements PartidaRepository {
  constructor(private readonly db: PrismaClient) {}

  async findAllOrderedByDate(): Promise<PartidaListItem[]> {
    const rows = await this.db.partida.findMany({
      orderBy: { dataHoraUtc: 'asc' },
      include: {
        fase: { select: { nomeExibicao: true, multiplicador: true } },
        equipeCasa: { select: { id: true, nome: true, sigla: true, bandeiraCodigo: true } },
        equipeFora: { select: { id: true, nome: true, sigla: true, bandeiraCodigo: true } },
      },
    })

    return rows.map((row) => ({
      id: row.id,
      faseNome: row.fase.nomeExibicao,
      // Prisma retorna Decimal para @db.Decimal — converter para number
      multiplicador: Number(row.fase.multiplicador),
      dataHoraUtc: row.dataHoraUtc,
      estadio: row.estadio,
      cidade: row.cidade,
      equipeCasa: row.equipeCasa,
      equipeFora: row.equipeFora,
      placeholderCasa: row.placeholderCasa,
      placeholderFora: row.placeholderFora,
      golsCasa: row.golsCasa,
      golsFora: row.golsFora,
      status: row.status,
      grupoSimultaneoId: row.grupoSimultaneoId,
    }))
  }
}
