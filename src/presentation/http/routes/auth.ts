import type { FastifyPluginAsync } from 'fastify'
import { RegisterSchema, LoginSchema } from '../dto/auth.js'
import type { RegisterUser } from '../../../application/identity/use-cases/RegisterUser.js'
import type { LoginUser } from '../../../application/identity/use-cases/LoginUser.js'
import type { ITokenService } from '../../../application/identity/ports/ITokenService.js'
import { createAuthMiddleware } from '../middlewares/authenticate.js'

interface AuthRouteOptions {
  registerUser: RegisterUser
  loginUser: LoginUser
  tokenService: ITokenService
}

const COOKIE_NAME = 'session'
const COOKIE_MAX_AGE_SECONDS = 2 * 60 * 60 // 2h — alinhado com JWT_EXPIRES_IN

export const authRoutes: FastifyPluginAsync<AuthRouteOptions> = async (fastify, opts) => {
  const authenticate = createAuthMiddleware(opts.tokenService)

  // POST /auth/register
  fastify.post('/register', async (request, reply) => {
    const body = RegisterSchema.parse(request.body)
    const result = await opts.registerUser.execute({ nome: body.nome, username: body.username, senha: body.senha })
    return reply.status(201).send(result)
  })

  // POST /auth/login — SECURITY.md §1: cookie httpOnly, SameSite=Lax
  fastify.post('/login', async (request, reply) => {
    const body = LoginSchema.parse(request.body)
    const { token, usuario } = await opts.loginUser.execute({ username: body.username, senha: body.senha })
    reply.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: COOKIE_MAX_AGE_SECONDS,
    })
    return reply.status(200).send(usuario)
  })

  // POST /auth/logout
  fastify.post('/logout', async (_request, reply) => {
    reply.clearCookie(COOKIE_NAME, { path: '/' })
    return reply.status(200).send({ message: 'Sessão encerrada.' })
  })

  // GET /auth/me — exige autenticação via preHandler
  fastify.get('/me', { preHandler: [authenticate] }, async (request, reply) => {
    // request.user é garantido pelo preHandler authenticate
    return reply.status(200).send(request.user!)
  })
}
