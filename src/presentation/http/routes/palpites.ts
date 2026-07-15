import type { FastifyPluginAsync } from 'fastify'
import { SubmitPalpiteSchema } from '../dto/palpite.js'
import type { SubmitPrediction } from '../../../application/bolao/use-cases/SubmitPrediction.js'
import type { GetMyPredictions } from '../../../application/bolao/use-cases/GetMyPredictions.js'
import type { GetPredictionsForMatch } from '../../../application/bolao/use-cases/GetPredictionsForMatch.js'
import type { ITokenService } from '../../../application/identity/ports/ITokenService.js'
import { createAuthMiddleware } from '../middlewares/authenticate.js'

interface PalpitesRouteOptions {
  submitPrediction: SubmitPrediction
  getMyPredictions: GetMyPredictions
  getPredictionsForMatch: GetPredictionsForMatch
  tokenService: ITokenService
}

export const palpitesRoutes: FastifyPluginAsync<PalpitesRouteOptions> = async (fastify, opts) => {
  const authenticate = createAuthMiddleware(opts.tokenService)

  // POST /palpites — envia ou edita palpite (ADR-004: bloqueio validado no use case)
  fastify.post('/palpites', { preHandler: [authenticate] }, async (request, reply) => {
    const user = request.user!
    const body = SubmitPalpiteSchema.parse(request.body)
    const result = await opts.submitPrediction.execute({
      usuarioId: user.id,
      partidaId: body.partidaId,
      golsCasaPalpite: body.golsCasaPalpite,
      golsForaPalpite: body.golsForaPalpite,
    })
    return reply.status(200).send(result)
  })

  // GET /palpites/me — todos os palpites do usuário autenticado
  fastify.get('/palpites/me', { preHandler: [authenticate] }, async (request, reply) => {
    const palpites = await opts.getMyPredictions.execute(request.user!.id)
    return reply.status(200).send(palpites)
  })

  // GET /palpites/partida/:id — palpites de uma partida
  // DOMAIN_RULES.md §9 — outros usuários visíveis apenas após o bloqueio
  fastify.get('/palpites/partida/:id', { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const partidaId = parseInt(id, 10)
    if (isNaN(partidaId)) {
      return reply.status(400).send({ error: { code: 'VALIDATION_ERROR', message: 'id inválido.' } })
    }
    const result = await opts.getPredictionsForMatch.execute(partidaId, request.user!.id)
    return reply.status(200).send(result)
  })
}
