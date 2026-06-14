import { describe, expect, it } from 'vitest'
import { PalpiteEstatico } from '../PalpiteEstatico.js'
import { StaticMarketLockedError } from '../errors.js'

// DOMAIN_RULES.md §9 — mercados estáticos bloqueados a partir de 11/06/2026 00:00 UTC
const STATIC_LOCK_DATE = new Date('2026-06-11T00:00:00Z')

describe('PalpiteEstatico.create()', () => {
  it('creates palpite with equipe when before lock date', () => {
    const before = new Date(STATIC_LOCK_DATE.getTime() - 1)
    const p = PalpiteEstatico.create('user-1', 'campeao', 5, null, before)
    expect(p.usuarioId).toBe('user-1')
    expect(p.mercado).toBe('campeao')
    expect(p.valorEquipeId).toBe(5)
    expect(p.valorTexto).toBeNull()
  })

  it('creates palpite with texto value for artilheiro', () => {
    const before = new Date(STATIC_LOCK_DATE.getTime() - 1)
    const p = PalpiteEstatico.create('user-1', 'artilheiro', null, 'Mbappé', before)
    expect(p.valorTexto).toBe('Mbappé')
    expect(p.valorEquipeId).toBeNull()
  })

  it('throws StaticMarketLockedError exactly at the lock date', () => {
    expect(() =>
      PalpiteEstatico.create('user-1', 'campeao', 5, null, STATIC_LOCK_DATE),
    ).toThrow(StaticMarketLockedError)
  })

  it('throws StaticMarketLockedError after the lock date', () => {
    const after = new Date('2026-06-14T12:00:00Z') // today
    expect(() =>
      PalpiteEstatico.create('user-1', 'vice', 3, null, after),
    ).toThrow(StaticMarketLockedError)
  })

  it('StaticMarketLockedError has code STATIC_MARKET_LOCKED', () => {
    try {
      PalpiteEstatico.create('user-1', 'campeao', 1, null, STATIC_LOCK_DATE)
      expect.fail('should have thrown')
    } catch (err) {
      expect(err).toBeInstanceOf(StaticMarketLockedError)
      expect((err as StaticMarketLockedError).code).toBe('STATIC_MARKET_LOCKED')
    }
  })
})
