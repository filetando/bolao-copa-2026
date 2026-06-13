import { AppError } from '../errors.js'

export class UsernameAlreadyExistsError extends AppError {
  constructor(username: string) {
    super('USERNAME_ALREADY_EXISTS', `O username "${username}" já está em uso.`)
  }
}

export class InvalidCredentialsError extends AppError {
  constructor() {
    super('INVALID_CREDENTIALS', 'Credenciais inválidas.')
  }
}
