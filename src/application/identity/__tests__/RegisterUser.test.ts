import { describe, expect, it, vi } from 'vitest'
import { RegisterUser } from '../use-cases/RegisterUser.js'
import { UsernameAlreadyExistsError } from '../../../domain/identity/errors.js'
import type { UsuarioRepository } from '../ports/UsuarioRepository.js'
import type { IHasher } from '../ports/IHasher.js'

function makeRepo(exists: boolean): UsuarioRepository {
  return {
    existsByUsername: vi.fn().mockResolvedValue(exists),
    save: vi.fn().mockResolvedValue(undefined),
    findByUsername: vi.fn().mockResolvedValue(null),
    findById: vi.fn().mockResolvedValue(null),
  }
}

function makeHasher(): IHasher {
  return {
    hash: vi.fn().mockResolvedValue('hashed-password'),
    verify: vi.fn().mockResolvedValue(false),
  }
}

describe('RegisterUser', () => {
  it('throws UsernameAlreadyExistsError when username is taken', async () => {
    const uc = new RegisterUser(makeRepo(true), makeHasher())
    await expect(uc.execute({ nome: 'Lucas', username: 'lucas', senha: '123456' }))
      .rejects.toThrow(UsernameAlreadyExistsError)
  })

  it('hashes the password before saving', async () => {
    const hasher = makeHasher()
    const repo = makeRepo(false)
    const uc = new RegisterUser(repo, hasher)
    await uc.execute({ nome: 'Lucas', username: 'lucas', senha: 'minhasenha' })
    expect(hasher.hash).toHaveBeenCalledWith('minhasenha')
    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({ passwordHash: 'hashed-password' }),
    )
  })

  it('saves the user to the repository', async () => {
    const repo = makeRepo(false)
    const uc = new RegisterUser(repo, makeHasher())
    await uc.execute({ nome: 'Lucas', username: 'lucas', senha: '123456' })
    expect(repo.save).toHaveBeenCalledOnce()
  })

  it('returns user data with id and default role "user"', async () => {
    const uc = new RegisterUser(makeRepo(false), makeHasher())
    const result = await uc.execute({ nome: 'Lucas Fileto', username: 'lucas', senha: '123456' })
    expect(result).toMatchObject({ nome: 'Lucas Fileto', username: 'lucas', role: 'user' })
    expect(typeof result.id).toBe('string')
    expect(result.id.length).toBeGreaterThan(0)
  })

  it('does not expose passwordHash in output', async () => {
    const uc = new RegisterUser(makeRepo(false), makeHasher())
    const result = await uc.execute({ nome: 'Lucas', username: 'lucas', senha: '123456' })
    expect(result).not.toHaveProperty('passwordHash')
  })
})
