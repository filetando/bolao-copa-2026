import { z } from 'zod'

// BACKEND_GUIDELINES §3: validar DTOs via Zod antes de chamar o use case
// SECURITY.md §4: tipos, ranges, tamanhos de string

export const RegisterSchema = z.object({
  nome: z.string().min(2).max(120).trim(),
  username: z
    .string()
    .min(3)
    .max(60)
    .trim()
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Username só pode conter letras, números, _, . e -'),
  // SECURITY.md §1: Argon2id não tem limite de 72 bytes como bcrypt, mas limitamos para evitar DoS
  senha: z.string().min(8).max(72),
})

export const LoginSchema = z.object({
  username: z.string().min(1).max(60).trim(),
  senha: z.string().min(1).max(72),
})

export type RegisterInput = z.infer<typeof RegisterSchema>
export type LoginInput = z.infer<typeof LoginSchema>
