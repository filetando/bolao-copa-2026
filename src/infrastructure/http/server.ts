import Fastify from 'fastify'
import cookie from '@fastify/cookie'
import cors from '@fastify/cors'

const app = Fastify({ logger: true })

await app.register(cookie)
await app.register(cors, {
  origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  credentials: true,
})

app.get('/health', async () => {
  return { status: 'ok' }
})

const port = Number(process.env.PORT ?? 3000)
const host = process.env.HOST ?? '0.0.0.0'

try {
  await app.listen({ port, host })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
