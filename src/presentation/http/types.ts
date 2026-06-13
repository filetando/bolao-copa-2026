export {}

declare module 'fastify' {
  interface FastifyRequest {
    user: { id: string; role: string; nome: string; username: string } | undefined
  }
}
