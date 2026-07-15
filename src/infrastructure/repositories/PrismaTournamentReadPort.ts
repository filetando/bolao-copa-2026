import type { PrismaClient } from '@prisma/client'
import type { TournamentReadPort, PartidaInfo } from '../../application/bolao/ports/TournamentReadPort.js'

export class PrismaTournamentReadPort implements TournamentReadPort {
  constructor(private readonly db: PrismaClient) {}

  async getPartida(id: number): Promise<PartidaInfo | null> {
    const row = await this.db.partida.findUnique({
      where: { id },
      select: {
        id: true,
        dataHoraUtc: true,
        status: true,
        grupoSimultaneoId: true,
        golsCasa: true,
        golsFora: true,
        fase: { select: { multiplicador: true } },
      },
    })
    if (!row) return null
    return {
      id: row.id,
      dataHoraUtc: row.dataHoraUtc,
      status: row.status,
      grupoSimultaneoId: row.grupoSimultaneoId,
      golsCasa: row.golsCasa,
      golsFora: row.golsFora,
      multiplicador: Number(row.fase.multiplicador),
    }
  }

  // DOMAIN_RULES.md §9 — retorna o menor dataHoraUtc do conjunto simultâneo
  async getMinDataHoraUtcForGrupoSimultaneo(grupoSimultaneoId: number): Promise<Date> {
    const row = await this.db.partida.findFirst({
      where: { grupoSimultaneoId },
      orderBy: { dataHoraUtc: 'asc' },
      select: { dataHoraUtc: true },
    })
    return row?.dataHoraUtc ?? new Date(0)
  }
}
