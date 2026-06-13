import { Usuario } from '../../../domain/identity/Usuario.js'
import { UsernameAlreadyExistsError } from '../../../domain/identity/errors.js'
import type { UsuarioRepository } from '../ports/UsuarioRepository.js'
import type { IHasher } from '../ports/IHasher.js'

export interface RegisterUserInput {
  nome: string
  username: string
  senha: string
}

export interface RegisterUserOutput {
  id: string
  nome: string
  username: string
  role: string
}

export class RegisterUser {
  constructor(
    private readonly usuarioRepo: UsuarioRepository,
    private readonly hasher: IHasher,
  ) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    if (await this.usuarioRepo.existsByUsername(input.username)) {
      throw new UsernameAlreadyExistsError(input.username)
    }
    const passwordHash = await this.hasher.hash(input.senha)
    const usuario = Usuario.create({
      id: crypto.randomUUID(),
      nome: input.nome,
      username: input.username,
      passwordHash,
    })
    await this.usuarioRepo.save(usuario)
    return { id: usuario.id, nome: usuario.nome, username: usuario.username, role: usuario.role }
  }
}
