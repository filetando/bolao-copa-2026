import type { FastifyPluginAsync } from 'fastify'
import type { GetDashboardEstatisticas } from '../../../application/bolao/use-cases/GetDashboardEstatisticas.js'
import type { ITokenService } from '../../../application/identity/ports/ITokenService.js'
import { createAuthMiddleware } from '../middlewares/authenticate.js'

interface DashboardRouteOptions {
  getDashboardEstatisticas: GetDashboardEstatisticas
  tokenService: ITokenService
}

export const dashboardRoutes: FastifyPluginAsync<DashboardRouteOptions> = async (fastify, opts) => {
  const authenticate = createAuthMiddleware(opts.tokenService)

  fastify.get('/dashboard/estatisticas', { preHandler: [authenticate] }, async (request, reply) => {
    const estatisticas = await opts.getDashboardEstatisticas.execute()
    return reply.status(200).send(estatisticas)
  })
}
