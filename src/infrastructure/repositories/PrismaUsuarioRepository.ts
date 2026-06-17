import type { PrismaClient } from '@prisma/client'
import { Usuario } from '../../domain/identity/Usuario.js'
import type { UsuarioRepository, UsuarioBasico } from '../../application/identity/ports/UsuarioRepository.js'

export class PrismaUsuarioRepository implements UsuarioRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByUsername(username: string): Promise<Usuario | null> {
    const row = await this.prisma.usuario.findUnique({ where: { username } })
    if (!row) return null
    return new Usuario(row.id, row.nome, row.username, row.passwordHash, row.role as 'user' | 'admin', row.createdAt)
  }

  async findById(id: string): Promise<Usuario | null> {
    const row = await this.prisma.usuario.findUnique({ where: { id } })
    if (!row) return null
    return new Usuario(row.id, row.nome, row.username, row.passwordHash, row.role as 'user' | 'admin', row.createdAt)
  }

  async existsByUsername(username: string): Promise<boolean> {
    const count = await this.prisma.usuario.count({ where: { username } })
    return count > 0
  }

  async save(usuario: Usuario): Promise<void> {
    await this.prisma.usuario.upsert({
      where: { id: usuario.id },
      create: {
        id: usuario.id,
        nome: usuario.nome,
        username: usuario.username,
        passwordHash: usuario.passwordHash,
        role: usuario.role,
        createdAt: usuario.createdAt,
      },
      update: {
        nome: usuario.nome,
        passwordHash: usuario.passwordHash,
        role: usuario.role,
      },
    })
  }

  async findAllBasic(): Promise<UsuarioBasico[]> {
    return this.prisma.usuario.findMany({
      select: { id: true, nome: true, username: true },
      orderBy: { nome: 'asc' },
    })
  }
}
