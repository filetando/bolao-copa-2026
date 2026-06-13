import argon2 from 'argon2'
import type { IHasher } from '../../application/identity/ports/IHasher.js'

// SECURITY.md §1: m=19456 (19 MiB), t=2, p=1 — parâmetros mínimos Argon2id
export class ArgonHasher implements IHasher {
  async hash(plain: string): Promise<string> {
    return argon2.hash(plain, { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 })
  }

  async verify(plain: string, hashed: string): Promise<boolean> {
    return argon2.verify(hashed, plain)
  }
}
