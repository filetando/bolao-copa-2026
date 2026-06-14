import { describe, expect, it } from 'vitest'
import { Palpite, LOCK_WINDOW_MS } from '../Palpite.js'
import { PredictionLockedError } from '../errors.js'

describe('Palpite.create()', () => {
  const usuarioId = 'user-1'
  const partidaId = 1

  it('creates palpite when well before the lock window', () => {
    // cutoff = now + LOCK_WINDOW + 60s → outside window → OK
    const cutoff = new Date(Date.now() + LOCK_WINDOW_MS + 60_000)
    const palpite = Palpite.create(usuarioId, partidaId, 2, 1, cutoff)
    expect(palpite.usuarioId).toBe(usuarioId)
    expect(palpite.partidaId).toBe(partidaId)
    expect(palpite.golsCasaPalpite).toBe(2)
    expect(palpite.golsForaPalpite).toBe(1)
  })

  it('throws PredictionLockedError when inside the lock window', () => {
    // cutoff = now + (LOCK_WINDOW - 3 min) → inside window → locked
    const cutoff = new Date(Date.now() + LOCK_WINDOW_MS - 3 * 60_000)
    expect(() => Palpite.create(usuarioId, partidaId, 0, 0, cutoff)).toThrow(PredictionLockedError)
  })

  it('throws PredictionLockedError when cutoff has already passed', () => {
    const cutoff = new Date(Date.now() - 60 * 60_000) // 1 hour ago
    expect(() => Palpite.create(usuarioId, partidaId, 0, 0, cutoff)).toThrow(PredictionLockedError)
  })

  it('PredictionLockedError has code PREDICTION_LOCKED', () => {
    const cutoff = new Date(Date.now() - 1)
    try {
      Palpite.create(usuarioId, partidaId, 0, 0, cutoff)
      expect.fail('should have thrown')
    } catch (err) {
      expect(err).toBeInstanceOf(PredictionLockedError)
      expect((err as PredictionLockedError).code).toBe('PREDICTION_LOCKED')
    }
  })
})
