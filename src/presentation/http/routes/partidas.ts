import type { FastifyPluginAsync } from 'fastify'
import type { ListMatches } from '../../../application/tournament/use-cases/ListMatches.js'

interface PartidasRouteOptions {
  listMatches: ListMatches
}

export const partidasRoutes: FastifyPluginAsync<PartidasRouteOptions> = async (fastify, opts) => {
  // GET /partidas — rota pública (SECURITY.md: leitura sem dado sensível, sem auth)
  fastify.get('/partidas', async (_request, reply) => {
    const partidas = await opts.listMatches.execute()
    return reply.status(200).send(partidas)
  })
}
