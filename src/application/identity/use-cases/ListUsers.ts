import type { UsuarioRepository, UsuarioBasico } from '../ports/UsuarioRepository.js'

export class ListUsers {
  constructor(private readonly usuarioRepo: UsuarioRepository) {}

  async execute(): Promise<UsuarioBasico[]> {
    return this.usuarioRepo.findAllBasic()
  }
}
