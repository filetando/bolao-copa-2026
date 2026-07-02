import type { PrismaClient } from '@prisma/client'
import type {
  PartidaRepository,
  PartidaListItem,
  PartidaBasica,
  AtualizacaoEquipesResolvidas,
} from '../../application/tournament/ports/PartidaRepository.js'

export class PrismaPartidaRepository implements PartidaRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: number): Promise<PartidaBasica | null> {
    return this.db.partida.findUnique({ where: { id }, select: { id: true, status: true } })
  }

  async registerResult(id: number, golsCasa: number, golsFora: number): Promise<void> {
    await this.db.partida.update({
      where: { id },
      data: { golsCasa, golsFora, status: 'encerrada' },
    })
  }

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
}
