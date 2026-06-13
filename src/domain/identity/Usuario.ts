export class Usuario {
  constructor(
    public readonly id: string,
    public readonly nome: string,
    public readonly username: string,
    public readonly passwordHash: string,
    public readonly role: 'user' | 'admin',
    public readonly createdAt: Date,
  ) {}

  static create(props: {
    id: string
    nome: string
    username: string
    passwordHash: string
    role?: 'user' | 'admin'
  }): Usuario {
    return new Usuario(props.id, props.nome, props.username, props.passwordHash, props.role ?? 'user', new Date())
  }
}
