import type { LeaderboardRepository } from '../ports/LeaderboardRepository.js'
import { calcularPerfilAcerto, type PerfilAcertoUsuario } from '../../../domain/bolao/dashboard/PerfilAcerto.js'
import { calcularPontosPorFase, type PontosPorFaseUsuario } from '../../../domain/bolao/dashboard/PontosPorFase.js'
import {
  calcularAproveitamentoPorFase,
  type AproveitamentoFase,
} from '../../../domain/bolao/dashboard/AproveitamentoPorFase.js'
import { calcularContrafactual, type ContrafactualUsuario } from '../../../domain/bolao/dashboard/Contrafactual.js'
import { calcularRecordes, type Recordes, type RodadaGrupo } from '../../../domain/bolao/dashboard/Recordes.js'

export interface DashboardEstatisticas {
  perfilAcerto: PerfilAcertoUsuario[]
  pontosPorFase: PontosPorFaseUsuario[]
  aproveitamentoPorFase: AproveitamentoFase[]
  contrafactual: ContrafactualUsuario[]
  recordes: Recordes
}

export class GetDashboardEstatisticas {
  constructor(
    private readonly repo: LeaderboardRepository,
    private readonly rodadasGrupos: Record<number, RodadaGrupo>,
  ) {}

  async execute(): Promise<DashboardEstatisticas> {
    const rows = await this.repo.findDetalhesPalpites()

    return {
      perfilAcerto: calcularPerfilAcerto(rows),
      pontosPorFase: calcularPontosPorFase(rows),
      aproveitamentoPorFase: calcularAproveitamentoPorFase(rows),
      contrafactual: calcularContrafactual(rows),
      recordes: calcularRecordes(rows, this.rodadasGrupos),
    }
  }
}
