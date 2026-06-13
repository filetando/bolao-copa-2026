export interface PalpiteEstaticoData {
  id: string
  usuarioId: string
  mercado: string
  valorEquipeId: number | null
  valorTexto: string | null
  pontosObtidos: number | null
  travadoEm: Date
}

export interface PalpiteEstaticoRepository {
  upsert(data: {
    usuarioId: string
    mercado: string
    valorEquipeId: number | null
    valorTexto: string | null
  }): Promise<PalpiteEstaticoData>
  findByUsuario(usuarioId: string): Promise<PalpiteEstaticoData[]>
}
