import { z } from 'zod'

// DOMAIN_RULES.md §9 — campeao/vice/terceiro_lugar requerem equipe; artilheiro requer texto
export const SubmitPalpiteEstaticoSchema = z.discriminatedUnion('mercado', [
  z.object({ mercado: z.literal('campeao'), valorEquipeId: z.number().int().positive() }),
  z.object({ mercado: z.literal('vice'), valorEquipeId: z.number().int().positive() }),
  z.object({ mercado: z.literal('terceiro_lugar'), valorEquipeId: z.number().int().positive() }),
  z.object({ mercado: z.literal('artilheiro'), valorTexto: z.string().min(2).max(80) }),
])

export type SubmitPalpiteEstaticoInput = z.infer<typeof SubmitPalpiteEstaticoSchema>
