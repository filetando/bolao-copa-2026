import type { PrismaClient } from '@prisma/client'
import type { PalpiteRepository, PalpiteData, PalpiteWithUser, PalpiteComPartida, PartidaComPalpiteData } from '../../application/bolao/ports/PalpiteRepository.js'

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

  async updatePontosObtidos(id: string, pontos: number): Promise<void> {
    await this.db.palpite.update({ where: { id }, data: { pontosObtidos: pontos } })
  }

  async findById(id: string): Promise<PalpiteData | null> {
    const row = await this.db.palpite.findUnique({ where: { id } })
    return row ? this.toData(row) : null
  }

  async updateGols(id: string, golsCasaPalpite: number, golsForaPalpite: number): Promise<void> {
    await this.db.palpite.update({ where: { id }, data: { golsCasaPalpite, golsForaPalpite } })
  }

  async findByUsuarioWithPartida(usuarioId: string): Promise<PalpiteComPartida[]> {
    const rows = await this.db.palpite.findMany({
      where: { usuarioId },
      orderBy: { partidaId: 'asc' },
      include: {
        partida: {
          include: {
            fase: { select: { id: true, nomeExibicao: true, multiplicador: true } },
            equipeCasa: { select: { id: true, nome: true, sigla: true, bandeiraCodigo: true } },
            equipeFora: { select: { id: true, nome: true, sigla: true, bandeiraCodigo: true } },
          },
        },
      },
    })
    return rows.map((r) => ({
      ...this.toData(r),
      partida: {
        id: r.partida.id,
        faseId: r.partida.faseId,
        faseNome: r.partida.fase.nomeExibicao,
        grupoId: r.partida.grupoId,
        dataHoraUtc: r.partida.dataHoraUtc,
        status: r.partida.status,
        golsCasa: r.partida.golsCasa,
        golsFora: r.partida.golsFora,
        multiplicador: Number(r.partida.fase.multiplicador),
        equipeCasa: r.partida.equipeCasa,
        equipeFora: r.partida.equipeFora,
        placeholderCasa: r.partida.placeholderCasa,
        placeholderFora: r.partida.placeholderFora,
      },
    }))
  }

  async findAllPartidasWithPalpiteForUser(usuarioId: string): Promise<PartidaComPalpiteData[]> {
    const partidas = await this.db.partida.findMany({
      orderBy: { id: 'asc' },
      include: {
        fase: { select: { id: true, nomeExibicao: true, multiplicador: true } },
        equipeCasa: { select: { id: true, nome: true, sigla: true, bandeiraCodigo: true } },
        equipeFora: { select: { id: true, nome: true, sigla: true, bandeiraCodigo: true } },
        palpites: {
          where: { usuarioId },
          select: { id: true, golsCasaPalpite: true, golsForaPalpite: true, pontosObtidos: true },
        },
      },
    })
    return partidas.map((p) => ({
      partida: {
        id: p.id,
        faseId: p.faseId,
        faseNome: p.fase.nomeExibicao,
        grupoId: p.grupoId,
        dataHoraUtc: p.dataHoraUtc,
        status: p.status,
        golsCasa: p.golsCasa,
        golsFora: p.golsFora,
        multiplicador: Number(p.fase.multiplicador),
        equipeCasa: p.equipeCasa,
        equipeFora: p.equipeFora,
        placeholderCasa: p.placeholderCasa,
        placeholderFora: p.placeholderFora,
      },
      palpite: p.palpites[0]
        ? {
            id: p.palpites[0].id,
            golsCasaPalpite: p.palpites[0].golsCasaPalpite,
            golsForaPalpite: p.palpites[0].golsForaPalpite,
            pontosObtidos: p.palpites[0].pontosObtidos,
          }
        : null,
    }))
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
