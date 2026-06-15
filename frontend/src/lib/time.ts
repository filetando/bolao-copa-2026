const BRT = 'America/Sao_Paulo'

// DOMAIN_RULES.md §10 — bloqueio no horário exato de início
export const LOCK_WINDOW_MS = 0

// Date da abertura do torneio — mercados estáticos travados a partir daqui
// DOMAIN_RULES.md §9
export const STATIC_MARKET_LOCK = new Date('2026-06-11T03:00:00Z')

export function isStaticMarketLocked(): boolean {
  return Date.now() >= STATIC_MARKET_LOCK.getTime()
}

export function isMatchLocked(cutoffUtc: string): boolean {
  return Date.now() >= new Date(cutoffUtc).getTime() - LOCK_WINDOW_MS
}

export function formatTimeBRT(isoUtc: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: BRT,
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoUtc))
}

export function formatDateLabelBRT(isoUtc: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: BRT,
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(isoUtc))
}

export function getDateKeyBRT(isoUtc: string): string {
  // Returns "DD/MM/YYYY" in BRT — used as grouping key
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: BRT,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(isoUtc))
}
