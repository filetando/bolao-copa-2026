import { SignJWT, jwtVerify } from 'jose'
import type { ITokenService, TokenPayload } from '../../application/identity/ports/ITokenService.js'

export class JoseTokenService implements ITokenService {
  private readonly key: Uint8Array

  constructor(
    secret: string,
    private readonly expiresIn: string = '2h',
  ) {
    this.key = new TextEncoder().encode(secret)
  }

  async sign(payload: TokenPayload): Promise<string> {
    return new SignJWT({ role: payload.role, nome: payload.nome, username: payload.username })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(payload.sub)
      .setIssuedAt()
      .setExpirationTime(this.expiresIn)
      .sign(this.key)
  }

  async verify(token: string): Promise<TokenPayload> {
    const { payload } = await jwtVerify(token, this.key)
    return {
      sub: payload.sub as string,
      role: payload['role'] as string,
      nome: payload['nome'] as string,
      username: payload['username'] as string,
    }
  }
}
