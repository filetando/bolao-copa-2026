import type {
  UserPayload,
  Partida,
  PalpiteData,
  PredictionsForMatch,
  LeaderboardRow,
  LeaderboardHistoryResponse,
  PalpiteEstaticoData,
  ClassificacaoRow,
  UsuarioBasico,
  PalpiteComPartida,
  PartidaComPalpiteAdmin,
  GenerateBracketResponse,
} from '../types/index.ts'

const BASE = '/api'

export interface ApiError {
  status: number
  error?: { code: string; message: string }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: { code: string; message: string } }
    const err: ApiError = { status: res.status, ...body }
    throw err
  }
  return res.json() as Promise<T>
}

export const api = {
  auth: {
    me: () => request<UserPayload>('/auth/me'),
    login: (username: string, senha: string) =>
      request<UserPayload>('/auth/login', { method: 'POST', body: JSON.stringify({ username, senha }) }),
    register: (nome: string, username: string, senha: string) =>
      request<UserPayload>('/auth/register', { method: 'POST', body: JSON.stringify({ nome, username, senha }) }),
    logout: () => request<{ message: string }>('/auth/logout', { method: 'POST' }),
  },
  partidas: {
    list: () => request<Partida[]>('/partidas'),
  },
  palpites: {
    me: () => request<PalpiteData[]>('/palpites/me'),
    submit: (partidaId: number, golsCasaPalpite: number, golsForaPalpite: number) =>
      request<PalpiteData>('/palpites', {
        method: 'POST',
        body: JSON.stringify({ partidaId, golsCasaPalpite, golsForaPalpite }),
      }),
    forMatch: (partidaId: number) => request<PredictionsForMatch>(`/palpites/partida/${partidaId}`),
  },
  leaderboard: {
    get: () => request<LeaderboardRow[]>('/leaderboard'),
    historico: () => request<LeaderboardHistoryResponse>('/leaderboard/historico'),
  },
  grupos: {
    classificacao: (grupoId: string) => request<ClassificacaoRow[]>(`/grupos/${grupoId}/classificacao`),
  },
  admin: {
    registerResult: (id: number, golsCasa: number, golsFora: number) =>
      request<{ partidaId: number; golsCasa: number; golsFora: number; palpitesCalculados: number }>(
        `/admin/partidas/${id}/resultado`,
        { method: 'POST', body: JSON.stringify({ golsCasa, golsFora }) },
      ),
    listUsuarios: () => request<UsuarioBasico[]>('/admin/usuarios'),
    getPalpitesUsuario: (usuarioId: string) => request<PalpiteComPartida[]>(`/admin/usuarios/${usuarioId}/palpites`),
    getPartidasComPalpite: (usuarioId: string) => request<PartidaComPalpiteAdmin[]>(`/admin/usuarios/${usuarioId}/partidas`),
    updatePalpite: (palpiteId: string, golsCasaPalpite: number, golsForaPalpite: number) =>
      request<{ palpiteId: string; pontosObtidos: number | null }>(
        `/admin/palpites/${palpiteId}`,
        { method: 'PUT', body: JSON.stringify({ golsCasaPalpite, golsForaPalpite }) },
      ),
    upsertPalpite: (usuarioId: string, partidaId: number, golsCasaPalpite: number, golsForaPalpite: number) =>
      request<{ palpiteId: string; pontosObtidos: number | null }>(
        `/admin/usuarios/${usuarioId}/palpites`,
        { method: 'POST', body: JSON.stringify({ partidaId, golsCasaPalpite, golsForaPalpite }) },
      ),
    generateBracket: () =>
      request<GenerateBracketResponse>('/admin/mata-mata/gerar', { method: 'POST' }),
  },
  palpitesEstaticos: {
    me: () => request<PalpiteEstaticoData[]>('/palpites-estaticos/me'),
    submit: (mercado: string, valorEquipeId?: number, valorTexto?: string) =>
      request<PalpiteEstaticoData>('/palpites-estaticos', {
        method: 'POST',
        body: JSON.stringify({
          mercado,
          ...(valorEquipeId != null ? { valorEquipeId } : {}),
          ...(valorTexto != null ? { valorTexto } : {}),
        }),
      }),
  },
}
