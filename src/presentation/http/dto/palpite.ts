import { z } from 'zod'

export const SubmitPalpiteSchema = z.object({
  partidaId: z.number().int().positive(),
  golsCasaPalpite: z.number().int().min(0),
  golsForaPalpite: z.number().int().min(0),
})
