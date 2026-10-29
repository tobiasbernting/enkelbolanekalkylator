import { describe, expect, it } from 'vitest'
import { BANK_RATE_PRESETS, getEffectiveRateForPortion, getEffectiveRatesByType, getRatesByType } from '../bankRates'

describe('getEffectiveRateForPortion', () => {
  const sbab = BANK_RATE_PRESETS.find((preset) => preset.id === 'sbab')!
  const nominal = getRatesByType(sbab, 'average')[1]
  const effective = getEffectiveRatesByType(sbab, 'average')[1]

  it("uses the bank's effective rate when the portion has the bank's rate", () => {
    expect(getEffectiveRateForPortion({ bankId: 'sbab', termYears: 1, interestRate: nominal }, 'average')).toBe(
      effective
    )
  })

  it('derives the effective rate from a custom rate', () => {
    expect(getEffectiveRateForPortion({ bankId: 'sbab', termYears: 1, interestRate: 1.2 }, 'average')).toBeCloseTo(
      (Math.pow(1 + 0.012 / 12, 12) - 1) * 100,
      9
    )
  })
})
