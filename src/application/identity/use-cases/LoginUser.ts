import { InvalidCredentialsError } from '../../../domain/identity/errors.js'
import type { UsuarioRepository } from '../ports/UsuarioRepository.js'
import type { IHasher } from '../ports/IHasher.js'
import type { ITokenService } from '../ports/ITokenService.js'

export interface LoginUserInput {
  username: string
  senha: string
}

export interface LoginUserOutput {
  token: string
  usuario: {
    id: string
    nome: string
    username: string
    role: string
  }
}

export class LoginUser {
  constructor(
    private readonly usuarioRepo: UsuarioRepository,
    private readonly hasher: IHasher,
    private readonly tokenService: ITokenService,
  ) {}

  async execute(input: LoginUserInput): Promise<LoginUserOutput> {
    const usuario = await this.usuarioRepo.findByUsername(input.username)
    if (!usuario) throw new InvalidCredentialsError()
    const valid = await this.hasher.verify(input.senha, usuario.passwordHash)
    if (!valid) throw new InvalidCredentialsError()
    const token = await this.tokenService.sign({
      sub: usuario.id,
      role: usuario.role,
      nome: usuario.nome,
      username: usuario.username,
    })
    return {
      token,
      usuario: { id: usuario.id, nome: usuario.nome, username: usuario.username, role: usuario.role },
    }
  }
}
