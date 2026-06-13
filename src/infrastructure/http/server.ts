import Fastify from 'fastify'
import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import { ZodError } from 'zod'
import { AppError } from '../../domain/errors.js'
import { prisma } from '../db/prisma.js'
import { ArgonHasher } from '../auth/ArgonHasher.js'
import { JoseTokenService } from '../auth/JoseTokenService.js'
import { PrismaUsuarioRepository } from '../repositories/PrismaUsuarioRepository.js'
import { RegisterUser } from '../../application/identity/use-cases/RegisterUser.js'
import { LoginUser } from '../../application/identity/use-cases/LoginUser.js'
import { authRoutes } from '../../presentation/http/routes/auth.js'

// Carrega augmentações de tipo (request.user)
import '../../presentation/http/types.js'

const app = Fastify({ logger: true })

// ─── Plugins ──────────────────────────────────────────────────────────────────

await app.register(cookie)
await app.register(cors, {
  origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  credentials: true,
})

// Necessário para o preHandler de autenticação poder setar request.user
app.decorateRequest('user', undefined)

// ─── Error handler global (BACKEND_GUIDELINES §4) ─────────────────────────────

app.setErrorHandler((error, request, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos.', details: error.flatten().fieldErrors },
    })
  }
  if (error instanceof AppError) {
    const statusMap: Record<string, number> = {
      USERNAME_ALREADY_EXISTS: 409,
      INVALID_CREDENTIALS: 401,
    }
    return reply
      .status(statusMap[error.code] ?? 400)
      .send({ error: { code: error.code, message: error.message } })
  }
  request.log.error(error)
  return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor.' } })
})

// ─── Composição de dependências (composition root) ────────────────────────────

const hasher = new ArgonHasher()
const tokenService = new JoseTokenService(
  process.env.JWT_SECRET ?? 'changeme-generate-a-strong-random-secret',
  process.env.JWT_EXPIRES_IN ?? '2h',
)
const usuarioRepo = new PrismaUsuarioRepository(prisma)
const registerUser = new RegisterUser(usuarioRepo, hasher)
const loginUser = new LoginUser(usuarioRepo, hasher, tokenService)

// ─── Rotas ────────────────────────────────────────────────────────────────────

app.get('/health', async () => ({ status: 'ok' }))

await app.register(authRoutes, { prefix: '/auth', registerUser, loginUser, tokenService })

// ─── Start ────────────────────────────────────────────────────────────────────

const port = Number(process.env.PORT ?? 3000)
const host = process.env.HOST ?? '0.0.0.0'

try {
  await app.listen({ port, host })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
