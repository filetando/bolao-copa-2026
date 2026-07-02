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
import { GetLeaderboardHistory } from '../../application/bolao/use-cases/GetLeaderboardHistory.js'
import { adminRoutes } from '../../presentation/http/routes/admin.js'
import { RegisterMatchResult } from '../../application/tournament/use-cases/RegisterMatchResult.js'
import { CalculateScoreForMatch } from '../../application/bolao/use-cases/CalculateScoreForMatch.js'
import { GetAdminUserPalpites } from '../../application/bolao/use-cases/GetAdminUserPalpites.js'
import { AdminUpdatePalpite } from '../../application/bolao/use-cases/AdminUpdatePalpite.js'
import { AdminUpsertPalpite } from '../../application/bolao/use-cases/AdminUpsertPalpite.js'
import { GetAdminPartidasComPalpite } from '../../application/bolao/use-cases/GetAdminPartidasComPalpite.js'
import { ListUsers } from '../../application/identity/use-cases/ListUsers.js'
import { gruposRoutes } from '../../presentation/http/routes/grupos.js'
import { PrismaGrupoRepository } from '../repositories/PrismaGrupoRepository.js'
import { GetGroupStandings } from '../../application/tournament/use-cases/GetGroupStandings.js'
import { GenerateKnockoutBracket } from '../../application/tournament/use-cases/GenerateKnockoutBracket.js'
import { AnexoCLookup } from '../../domain/tournament/AnexoCLookup.js'
import { loadAnexoCTable } from '../tournament/loadAnexoCTable.js'
import { BracketPropagationService } from '../../domain/tournament/BracketPropagationService.js'
import { loadBracketDependencias } from '../tournament/loadBracketDependencias.js'
import { ListMataMataMatches } from '../../application/tournament/use-cases/ListMataMataMatches.js'
import { SaveStandingsSnapshot } from '../../application/bolao/use-cases/SaveStandingsSnapshot.js'
import { FileSnapshotWriter } from '../snapshot/FileSnapshotWriter.js'

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
      MATCH_ALREADY_FINISHED: 409,
      MATCH_NOT_ENCERRADA: 422,
      GROUP_NOT_FOUND: 404,
      GROUP_STAGE_NOT_COMPLETE: 422,
      INVALID_COMBINACAO: 422,
      PENALTY_WINNER_REQUIRED: 422,
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
const listMataMataMatches = new ListMataMataMatches(partidaRepo)

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
const getLeaderboardHistory = new GetLeaderboardHistory(leaderboardRepo)

const bracketPropagation = new BracketPropagationService(loadBracketDependencias())
const registerMatchResult = new RegisterMatchResult(partidaRepo, bracketPropagation)
const calculateScoreForMatch = new CalculateScoreForMatch(tournamentReadPort, palpiteRepo)
const saveStandingsSnapshot = new SaveStandingsSnapshot(leaderboardRepo, palpiteRepo, new FileSnapshotWriter())
const getAdminUserPalpites = new GetAdminUserPalpites(palpiteRepo)
const adminUpdatePalpite = new AdminUpdatePalpite(palpiteRepo, tournamentReadPort)
const adminUpsertPalpite = new AdminUpsertPalpite(palpiteRepo, tournamentReadPort)
const getAdminPartidasComPalpite = new GetAdminPartidasComPalpite(palpiteRepo)
const listUsers = new ListUsers(usuarioRepo)

const grupoRepo = new PrismaGrupoRepository(prisma)
const getGroupStandings = new GetGroupStandings(grupoRepo)

const anexoCLookup = new AnexoCLookup(loadAnexoCTable())
const generateKnockoutBracket = new GenerateKnockoutBracket(grupoRepo, partidaRepo, anexoCLookup)

// ─── Rotas ────────────────────────────────────────────────────────────────────

app.get('/health', async () => ({ status: 'ok' }))

await app.register(authRoutes, { prefix: '/auth', registerUser, loginUser, tokenService })
await app.register(partidasRoutes, { listMatches, listMataMataMatches })
await app.register(palpitesRoutes, { submitPrediction, getMyPredictions, getPredictionsForMatch, tokenService })
await app.register(palpitesEstaticosRoutes, { submitStaticMarketPrediction, getMyStaticPredictions, tokenService })
await app.register(leaderboardRoutes, { getLeaderboard, getLeaderboardHistory, tokenService })
await app.register(adminRoutes, { registerMatchResult, calculateScoreForMatch, saveStandingsSnapshot, getAdminUserPalpites, adminUpdatePalpite, adminUpsertPalpite, getAdminPartidasComPalpite, generateKnockoutBracket, listUsers, tokenService })
await app.register(gruposRoutes, { getGroupStandings })

// ─── Start ────────────────────────────────────────────────────────────────────

const port = Number(process.env.PORT ?? 3000)
const host = process.env.HOST ?? '0.0.0.0'

try {
  await app.listen({ port, host })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
