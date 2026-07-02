import type { FastifyPluginAsync } from 'fastify'
import type { ListMatches } from '../../../application/tournament/use-cases/ListMatches.js'
import type { ListMataMataMatches } from '../../../application/tournament/use-cases/ListMataMataMatches.js'

interface PartidasRouteOptions {
  listMatches: ListMatches
  listMataMataMatches: ListMataMataMatches
}

export const partidasRoutes: FastifyPluginAsync<PartidasRouteOptions> = async (fastify, opts) => {
  // GET /partidas — rota pública (SECURITY.md: leitura sem dado sensível, sem auth)
  fastify.get('/partidas', async (_request, reply) => {
    const partidas = await opts.listMatches.execute()
    return reply.status(200).send(partidas)
  })

  // GET /mata-mata — jogos 73-104, rota pública (mesmo padrão de /partidas)
  fastify.get('/mata-mata', async (_request, reply) => {
    const partidas = await opts.listMataMataMatches.execute()
    return reply.status(200).send(partidas)
  })
}
