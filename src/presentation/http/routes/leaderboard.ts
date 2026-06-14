import type { FastifyPluginAsync } from 'fastify'
import type { GetLeaderboard } from '../../../application/bolao/use-cases/GetLeaderboard.js'
import type { ITokenService } from '../../../application/identity/ports/ITokenService.js'
import { createAuthMiddleware } from '../middlewares/authenticate.js'

interface LeaderboardRouteOptions {
  getLeaderboard: GetLeaderboard
  tokenService: ITokenService
}

export const leaderboardRoutes: FastifyPluginAsync<LeaderboardRouteOptions> = async (fastify, opts) => {
  const authenticate = createAuthMiddleware(opts.tokenService)

  fastify.get('/leaderboard', { preHandler: [authenticate] }, async (request, reply) => {
    const ranking = await opts.getLeaderboard.execute()
    return reply.status(200).send(ranking)
  })
}
