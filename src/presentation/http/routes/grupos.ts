import type { FastifyPluginAsync } from 'fastify'
import type { GetGroupStandings } from '../../../application/tournament/use-cases/GetGroupStandings.js'

interface GruposRouteOptions {
  getGroupStandings: GetGroupStandings
}

export const gruposRoutes: FastifyPluginAsync<GruposRouteOptions> = async (fastify, opts) => {
  // GET /grupos/:id/classificacao — público
  fastify.get('/grupos/:id/classificacao', async (request, reply) => {
    const { id } = request.params as { id: string }
    const classificacao = await opts.getGroupStandings.execute(id.toUpperCase())
    return reply.status(200).send(classificacao)
  })
}
