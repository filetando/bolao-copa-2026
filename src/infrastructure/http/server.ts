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
import { partidasRoutes } from '../../presentation/http/routes/partidas.js'
import { PrismaPartidaRepository } from '../repositories/PrismaPartidaRepository.js'
import { ListMatches } from '../../application/tournament/use-cases/ListMatches.js'
import { palpitesRoutes } from '../../presentation/http/routes/palpites.js'
import { PrismaPalpiteRepository } from '../repositories/PrismaPalpiteRepository.js'
import { PrismaTournamentReadPort } from '../repositories/PrismaTournamentReadPort.js'
import { SubmitPrediction } from '../../application/bolao/use-cases/SubmitPrediction.js'
import { GetMyPredictions } from '../../application/bolao/use-cases/GetMyPredictions.js'
import { GetPredictionsForMatch } from '../../application/bolao/use-cases/GetPredictionsForMatch.js'
import { palpitesEstaticosRoutes } from '../../presentation/http/routes/palpitesEstaticos.js'
import { PrismaPalpiteEstaticoRepository } from '../repositories/PrismaPalpiteEstaticoRepository.js'
import { SubmitStaticMarketPrediction } from '../../application/bolao/use-cases/SubmitStaticMarketPrediction.js'
import { GetMyStaticPredictions } from '../../application/bolao/use-cases/GetMyStaticPredictions.js'
import { leaderboardRoutes } from '../../presentation/http/routes/leaderboard.js'
import { PrismaLeaderboardRepository } from '../repositories/PrismaLeaderboardRepository.js'
import { GetLeaderboard } from '../../application/bolao/use-cases/GetLeaderboard.js'

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
      PREDICTION_LOCKED: 409,
      MATCH_NOT_FOUND: 404,
      STATIC_MARKET_LOCKED: 409,
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

const partidaRepo = new PrismaPartidaRepository(prisma)
const listMatches = new ListMatches(partidaRepo)

const palpiteRepo = new PrismaPalpiteRepository(prisma)
const tournamentReadPort = new PrismaTournamentReadPort(prisma)
const submitPrediction = new SubmitPrediction(palpiteRepo, tournamentReadPort)
const getMyPredictions = new GetMyPredictions(palpiteRepo)
const getPredictionsForMatch = new GetPredictionsForMatch(palpiteRepo, tournamentReadPort)

const palpiteEstaticoRepo = new PrismaPalpiteEstaticoRepository(prisma)
const submitStaticMarketPrediction = new SubmitStaticMarketPrediction(palpiteEstaticoRepo)
const getMyStaticPredictions = new GetMyStaticPredictions(palpiteEstaticoRepo)

const leaderboardRepo = new PrismaLeaderboardRepository(prisma)
const getLeaderboard = new GetLeaderboard(leaderboardRepo)

// ─── Rotas ────────────────────────────────────────────────────────────────────

app.get('/health', async () => ({ status: 'ok' }))

await app.register(authRoutes, { prefix: '/auth', registerUser, loginUser, tokenService })
await app.register(partidasRoutes, { listMatches })
await app.register(palpitesRoutes, { submitPrediction, getMyPredictions, getPredictionsForMatch, tokenService })
await app.register(palpitesEstaticosRoutes, { submitStaticMarketPrediction, getMyStaticPredictions, tokenService })
await app.register(leaderboardRoutes, { getLeaderboard, tokenService })

// ─── Start ────────────────────────────────────────────────────────────────────

const port = Number(process.env.PORT ?? 3000)
const host = process.env.HOST ?? '0.0.0.0'

try {
  await app.listen({ port, host })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
