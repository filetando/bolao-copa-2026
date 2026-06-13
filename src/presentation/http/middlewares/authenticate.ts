import type { FastifyRequest, FastifyReply } from 'fastify'
import type { ITokenService } from '../../../application/identity/ports/ITokenService.js'

export function createAuthMiddleware(tokenService: ITokenService) {
  return async function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const token = request.cookies['session']
    if (!token) {
      reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'Não autenticado.' } })
      return
    }
    try {
      const payload = await tokenService.verify(token)
      request.user = { id: payload.sub, role: payload.role, nome: payload.nome, username: payload.username }
    } catch {
      reply.status(401).send({ error: { code: 'INVALID_SESSION', message: 'Sessão inválida ou expirada.' } })
    }
  }
}
