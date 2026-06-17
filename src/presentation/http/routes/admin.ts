import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import type { RegisterMatchResult } from '../../../application/tournament/use-cases/RegisterMatchResult.js'
import type { CalculateScoreForMatch } from '../../../application/bolao/use-cases/CalculateScoreForMatch.js'
import type { GetAdminUserPalpites } from '../../../application/bolao/use-cases/GetAdminUserPalpites.js'
import type { AdminUpdatePalpite } from '../../../application/bolao/use-cases/AdminUpdatePalpite.js'
import type { ListUsers } from '../../../application/identity/use-cases/ListUsers.js'
import type { ITokenService } from '../../../application/identity/ports/ITokenService.js'
import { createAuthMiddleware } from '../middlewares/authenticate.js'
import { requireAdmin } from '../middlewares/requireAdmin.js'

interface AdminRouteOptions {
  registerMatchResult: RegisterMatchResult
  calculateScoreForMatch: CalculateScoreForMatch
  getAdminUserPalpites: GetAdminUserPalpites
  adminUpdatePalpite: AdminUpdatePalpite
  listUsers: ListUsers
  tokenService: ITokenService
}

const RegisterResultBodySchema = z.object({
  golsCasa: z.number().int().min(0),
  golsFora: z.number().int().min(0),
})

const UpdatePalpiteBodySchema = z.object({
  golsCasaPalpite: z.number().int().min(0),
  golsForaPalpite: z.number().int().min(0),
})

export const adminRoutes: FastifyPluginAsync<AdminRouteOptions> = async (fastify, opts) => {
  const authenticate = createAuthMiddleware(opts.tokenService)
  const guard = [authenticate, requireAdmin]

  // POST /admin/partidas/:id/resultado — registra placar e calcula pontos
  fastify.post('/admin/partidas/:id/resultado', { preHandler: guard }, async (request, reply) => {
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

  // GET /admin/usuarios — lista todos os usuários (básico)
  fastify.get('/admin/usuarios', { preHandler: guard }, async (_request, reply) => {
    const usuarios = await opts.listUsers.execute()
    return reply.status(200).send(usuarios)
  })

  // GET /admin/usuarios/:usuarioId/palpites — palpites de um usuário com dados da partida
  fastify.get('/admin/usuarios/:usuarioId/palpites', { preHandler: guard }, async (request, reply) => {
    const { usuarioId } = request.params as { usuarioId: string }
    const palpites = await opts.getAdminUserPalpites.execute(usuarioId)
    return reply.status(200).send(palpites)
  })

  // PUT /admin/palpites/:palpiteId — altera gols de um palpite e recalcula pontos
  fastify.put('/admin/palpites/:palpiteId', { preHandler: guard }, async (request, reply) => {
    const { palpiteId } = request.params as { palpiteId: string }
    const body = UpdatePalpiteBodySchema.parse(request.body)
    const result = await opts.adminUpdatePalpite.execute({
      palpiteId,
      golsCasaPalpite: body.golsCasaPalpite,
      golsForaPalpite: body.golsForaPalpite,
    })
    return reply.status(200).send(result)
  })
}
