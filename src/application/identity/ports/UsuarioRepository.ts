import type { Usuario } from '../../../domain/identity/Usuario.js'

export interface UsuarioBasico {
  id: string
  nome: string
  username: string
}

export interface UsuarioRepository {
  findByUsername(username: string): Promise<Usuario | null>
  findById(id: string): Promise<Usuario | null>
  existsByUsername(username: string): Promise<boolean>
  save(usuario: Usuario): Promise<void>
  findAllBasic(): Promise<UsuarioBasico[]>
}
