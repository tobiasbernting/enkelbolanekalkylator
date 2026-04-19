import { beforeEach, describe, expect, it } from 'vitest'
import {
  SAVED_CALCULATIONS_STORAGE_KEY,
  getSavedCalculations,
  saveCurrentCalculation,
  sanitizeSavedCalculationsStorage,
} from '../savedCalculationsStorage'

describe('savedCalculationsStorage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('saves current calculation with name, date and url', () => {
    const result = saveCurrentCalculation({
      name: 'Min kalkyl',
      calculationUrl: 'https://example.com/?housePrice=2000000&downPayment=400000',
    })

    expect(result.ok).toBe(true)
    if (!result.ok) {
      return
    }

    const saved = getSavedCalculations()
    expect(saved).toHaveLength(1)
    expect(saved[0].name).toBe('Min kalkyl')
    expect(saved[0].version).toBe(1)
    expect(saved[0].calculationUrl).toContain('housePrice=2000000')
    expect(Number.isFinite(Date.parse(saved[0].createdAt))).toBe(true)
  })

  it('rejects empty name', () => {
    const result = saveCurrentCalculation({
      name: '   ',
      calculationUrl: 'https://example.com/?housePrice=2000000',
    })

    expect(result.ok).toBe(false)
    expect(getSavedCalculations()).toHaveLength(0)
  })

  it('clears incompatible objects from local storage', () => {
    window.localStorage.setItem(
      SAVED_CALCULATIONS_STORAGE_KEY,
      JSON.stringify([
        {
          id: 'old-1',
          name: 'Gammal',
          createdAt: 'not-a-date',
        },
      ])
    )

    sanitizeSavedCalculationsStorage()

    expect(window.localStorage.getItem(SAVED_CALCULATIONS_STORAGE_KEY)).toBeNull()
    expect(getSavedCalculations()).toHaveLength(0)
  })
})