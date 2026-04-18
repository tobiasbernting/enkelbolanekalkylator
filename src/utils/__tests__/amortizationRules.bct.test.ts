import { describe, expect, it } from 'vitest'
import { calculateRequiredAmortizationRate } from '../calculations'

describe('BCT: amortization rules', () => {
  it('applies 2% when belaningsgrad is above 70%', () => {
    const rate = calculateRequiredAmortizationRate(800000, 1000000, 300000)
    expect(rate).toBe(0.02)
  })

  it('applies 1% when belaningsgrad is between 50% and 70%', () => {
    const rate = calculateRequiredAmortizationRate(600000, 1000000, 300000)
    expect(rate).toBe(0.01)
  })

  it('adds +1% when skuldkvot is above 4.5x', () => {
    const rate = calculateRequiredAmortizationRate(800000, 1000000, 150000)
    expect(rate).toBe(0.03)
  })

  it('does not add debt-ratio penalty when income is missing', () => {
    const rate = calculateRequiredAmortizationRate(800000, 1000000, 0)
    expect(rate).toBe(0.02)
  })
})
