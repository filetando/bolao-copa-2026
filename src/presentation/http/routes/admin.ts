import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import type { RegisterMatchResult } from '../../../application/tournament/use-cases/RegisterMatchResult.js'
import type { CalculateScoreForMatch } from '../../../application/bolao/use-cases/CalculateScoreForMatch.js'
import type { ITokenService } from '../../../application/identity/ports/ITokenService.js'
import { createAuthMiddleware } from '../middlewares/authenticate.js'
import { requireAdmin } from '../middlewares/requireAdmin.js'

interface AdminRouteOptions {
  registerMatchResult: RegisterMatchResult
  calculateScoreForMatch: CalculateScoreForMatch
  tokenService: ITokenService
}

const RegisterResultBodySchema = z.object({
  golsCasa: z.number().int().min(0),
  golsFora: z.number().int().min(0),
})

export const adminRoutes: FastifyPluginAsync<AdminRouteOptions> = async (fastify, opts) => {
  const authenticate = createAuthMiddleware(opts.tokenService)

  // POST /admin/partidas/:id/resultado — registra placar e calcula pontos de todos os palpites
  fastify.post('/admin/partidas/:id/resultado', { preHandler: [authenticate, requireAdmin] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const partidaId = parseInt(id, 10)
    if (isNaN(partidaId)) {
      return reply.status(400).send({ error: { code: 'VALIDATION_ERROR', message: 'id inválido.' } })
    }

    const body = RegisterResultBodySchema.parse(request.body)

    await opts.registerMatchResult.execute({
      adminId: request.user!.id,
      partidaId,
      golsCasa: body.golsCasa,
      golsFora: body.golsFora,
    })

    const { count } = await opts.calculateScoreForMatch.execute({ partidaId })

    return reply.status(200).send({ partidaId, golsCasa: body.golsCasa, golsFora: body.golsFora, palpitesCalculados: count })
  })
}
