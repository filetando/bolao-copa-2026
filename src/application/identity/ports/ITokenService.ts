export interface TokenPayload {
  sub: string
  role: string
  nome: string
  username: string
}

export interface ITokenService {
  sign(payload: TokenPayload): Promise<string>
  verify(token: string): Promise<TokenPayload>
}
