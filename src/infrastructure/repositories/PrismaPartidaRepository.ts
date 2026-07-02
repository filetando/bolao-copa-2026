import type { PrismaClient } from '@prisma/client'
import type {
  PartidaRepository,
  PartidaListItem,
  PartidaBasica,
  AtualizacaoEquipesResolvidas,
  ResolucaoLadoPartida,
} from '../../application/tournament/ports/PartidaRepository.js'

const SELECT_LISTAGEM = {
  fase: { select: { nomeExibicao: true, multiplicador: true } },
  equipeCasa: { select: { id: true, nome: true, sigla: true, bandeiraCodigo: true } },
  equipeFora: { select: { id: true, nome: true, sigla: true, bandeiraCodigo: true } },
} as const

function toListItem(row: {
  id: number
  fase: { nomeExibicao: string; multiplicador: unknown }
  dataHoraUtc: Date
  estadio: string | null
  cidade: string | null
  equipeCasa: PartidaListItem['equipeCasa']
  equipeFora: PartidaListItem['equipeFora']
  placeholderCasa: string | null
  placeholderFora: string | null
  golsCasa: number | null
  golsFora: number | null
  status: string
  grupoSimultaneoId: number | null
}): PartidaListItem {
  return {
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
  }
}

export class PrismaPartidaRepository implements PartidaRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: number): Promise<PartidaBasica | null> {
    return this.db.partida.findUnique({
      where: { id },
      select: { id: true, faseId: true, equipeCasaId: true, equipeForaId: true, status: true },
    })
  }

  async registerResult(
    id: number,
    golsCasa: number,
    golsFora: number,
    vencedorPenaltisEquipeId?: number,
  ): Promise<void> {
    await this.db.partida.update({
      where: { id },
      data: { golsCasa, golsFora, status: 'encerrada', vencedorPenaltisEquipeId },
    })
  }

  async findAllOrderedByDate(): Promise<PartidaListItem[]> {
    const rows = await this.db.partida.findMany({
      orderBy: { dataHoraUtc: 'asc' },
      include: SELECT_LISTAGEM,
    })
    return rows.map(toListItem)
  }

  async findMataMata(): Promise<PartidaListItem[]> {
    const rows = await this.db.partida.findMany({
      where: { faseId: { not: 'grupos' } },
      orderBy: { id: 'asc' },
      include: SELECT_LISTAGEM,
    })
    return rows.map(toListItem)
  }

  async updateEquipesResolvidas(updates: AtualizacaoEquipesResolvidas[]): Promise<void> {
    await this.db.$transaction(
      updates.map((u) =>
        this.db.partida.update({
          where: { id: u.id },
          data: { equipeCasaId: u.equipeCasaId, equipeForaId: u.equipeForaId },
        }),
      ),
    )
  }

  async resolverLadosPartidas(resolucoes: ResolucaoLadoPartida[]): Promise<void> {
    await this.db.$transaction(
      resolucoes.map((r) =>
        this.db.partida.update({
          where: { id: r.partidaId },
          data: r.lado === 'casa' ? { equipeCasaId: r.equipeId } : { equipeForaId: r.equipeId },
        }),
      ),
    )
  }
}
