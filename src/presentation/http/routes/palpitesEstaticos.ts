import type { FastifyPluginAsync } from 'fastify'
import { SubmitPalpiteEstaticoSchema } from '../dto/palpiteEstatico.js'
import type { SubmitStaticMarketPrediction } from '../../../application/bolao/use-cases/SubmitStaticMarketPrediction.js'
import type { GetMyStaticPredictions } from '../../../application/bolao/use-cases/GetMyStaticPredictions.js'
import type { ITokenService } from '../../../application/identity/ports/ITokenService.js'
import { createAuthMiddleware } from '../middlewares/authenticate.js'

interface PalpitesEstaticosRouteOptions {
  submitStaticMarketPrediction: SubmitStaticMarketPrediction
  getMyStaticPredictions: GetMyStaticPredictions
  tokenService: ITokenService
}

export const palpitesEstaticosRoutes: FastifyPluginAsync<PalpitesEstaticosRouteOptions> = async (fastify, opts) => {
  const authenticate = createAuthMiddleware(opts.tokenService)

  // POST /palpites-estaticos — envia ou atualiza palpite de mercado estático
  // DOMAIN_RULES.md §9: imutável após 11/06/2026 (abertura do torneio)
  fastify.post('/palpites-estaticos', { preHandler: [authenticate] }, async (request, reply) => {
    const user = request.user!
    const body = SubmitPalpiteEstaticoSchema.parse(request.body)

    const valorEquipeId = 'valorEquipeId' in body ? body.valorEquipeId : null
    const valorTexto = 'valorTexto' in body ? body.valorTexto : null

    const result = await opts.submitStaticMarketPrediction.execute({
      usuarioId: user.id,
      mercado: body.mercado,
      valorEquipeId,
      valorTexto,
    })
    return reply.status(200).send(result)
  })

  // GET /palpites-estaticos/me — todos os palpites estáticos do usuário autenticado
  fastify.get('/palpites-estaticos/me', { preHandler: [authenticate] }, async (request, reply) => {
    const palpites = await opts.getMyStaticPredictions.execute(request.user!.id)
    return reply.status(200).send(palpites)
  })
}
