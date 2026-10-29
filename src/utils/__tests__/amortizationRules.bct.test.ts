import { describe, expect, it } from 'vitest'
import { calculateRequiredAmortizationRate } from '../calculations'

// Lag (2026:226) om begränsning av bostadskrediter, gäller från 2026-04-01.
describe('BCT: amortization rules', () => {
  it('applies 2% when belaningsgrad is above 70%', () => {
    const rate = calculateRequiredAmortizationRate(800000, 1000000)
    expect(rate).toBe(0.02)
  })

  it('applies 1% when belaningsgrad is between 50% and 70%', () => {
    const rate = calculateRequiredAmortizationRate(600000, 1000000)
    expect(rate).toBe(0.01)
  })

  it('requires no amortization at exactly 50% belaningsgrad', () => {
    const rate = calculateRequiredAmortizationRate(500000, 1000000)
    expect(rate).toBe(0)
  })

  it('applies 1% at exactly 70% belaningsgrad', () => {
    const rate = calculateRequiredAmortizationRate(700000, 1000000)
    expect(rate).toBe(0.01)
  })

  it('caps at 2% regardless of skuldkvot (skärpt amorteringskrav removed 2026-04-01)', () => {
    // 900 000 kr loan on 1 000 000 kr, which would have been 3% under the old rules
    // for an income where the loan is above 4.5x.
    const rate = calculateRequiredAmortizationRate(900000, 1000000)
    expect(rate).toBe(0.02)
  })
})
