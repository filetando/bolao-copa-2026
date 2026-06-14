import { describe, expect, it, vi } from 'vitest'
import { LoginUser } from '../use-cases/LoginUser.js'
import { InvalidCredentialsError } from '../../../domain/identity/errors.js'
import { Usuario } from '../../../domain/identity/Usuario.js'
import type { UsuarioRepository } from '../ports/UsuarioRepository.js'
import type { IHasher } from '../ports/IHasher.js'
import type { ITokenService } from '../ports/ITokenService.js'

function makeUsuario() {
  return Usuario.create({
    id: 'user-1',
    nome: 'Lucas',
    username: 'lucas',
    passwordHash: 'hashed-password',
  })
}

function makeRepo(user: Usuario | null): UsuarioRepository {
  return {
    findByUsername: vi.fn().mockResolvedValue(user),
    findById: vi.fn().mockResolvedValue(null),
    existsByUsername: vi.fn().mockResolvedValue(false),
    save: vi.fn().mockResolvedValue(undefined),
  }
}

function makeHasher(valid: boolean): IHasher {
  return {
    hash: vi.fn().mockResolvedValue(''),
    verify: vi.fn().mockResolvedValue(valid),
  }
}

function makeTokenService(): ITokenService {
  return {
    sign: vi.fn().mockResolvedValue('jwt-token'),
    verify: vi.fn().mockResolvedValue({ sub: 'user-1', role: 'user', nome: 'Lucas', username: 'lucas' }),
  }
}

describe('LoginUser', () => {
  it('throws InvalidCredentialsError when user is not found', async () => {
    const uc = new LoginUser(makeRepo(null), makeHasher(false), makeTokenService())
    await expect(uc.execute({ username: 'ninguem', senha: '123' }))
      .rejects.toThrow(InvalidCredentialsError)
  })

  it('throws InvalidCredentialsError when password does not match', async () => {
    const uc = new LoginUser(makeRepo(makeUsuario()), makeHasher(false), makeTokenService())
    await expect(uc.execute({ username: 'lucas', senha: 'errada' }))
      .rejects.toThrow(InvalidCredentialsError)
  })

  it('returns token and user data on success', async () => {
    const uc = new LoginUser(makeRepo(makeUsuario()), makeHasher(true), makeTokenService())
    const result = await uc.execute({ username: 'lucas', senha: 'correta' })
    expect(result.token).toBe('jwt-token')
    expect(result.usuario).toMatchObject({ id: 'user-1', username: 'lucas', nome: 'Lucas', role: 'user' })
  })

  it('signs token with correct payload', async () => {
    const tokenService = makeTokenService()
    const uc = new LoginUser(makeRepo(makeUsuario()), makeHasher(true), tokenService)
    await uc.execute({ username: 'lucas', senha: 'correta' })
    expect(tokenService.sign).toHaveBeenCalledWith(
      expect.objectContaining({ sub: 'user-1', nome: 'Lucas', username: 'lucas', role: 'user' }),
    )
  })

  it('does not expose passwordHash in output', async () => {
    const uc = new LoginUser(makeRepo(makeUsuario()), makeHasher(true), makeTokenService())
    const result = await uc.execute({ username: 'lucas', senha: 'correta' })
    expect(result).not.toHaveProperty('passwordHash')
    expect(result.usuario).not.toHaveProperty('passwordHash')
  })
})
