import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useBankComparisonView } from '../useBankComparisonView'

describe('useBankComparisonView', () => {
  it('exposes empty state when rows are missing', () => {
    const { result } = renderHook(() => useBankComparisonView({ rows: [] }))

    expect(result.current.hasRows).toBe(false)
    expect(result.current.portionHeaders).toEqual([])
  })

  it('uses first row portion rates as headers and formats terms', () => {
    const rows = [
      {
        bankId: 'sbab',
        bankLabel: 'SBAB',
        loanAmountSeK: 2000000,
        nominalRatePercent: 3.5,
        effectiveRatePercent: 3.7,
        portionRates: [
          { id: 'a', termYears: 0.25, ratePercent: 3.1, effectiveRatePercent: 3.3 },
          { id: 'b', termYears: 3, ratePercent: 3.4, effectiveRatePercent: 3.6 },
        ],
        monthlyInterestSeK: 5000,
        monthlyEffectiveInterestSeK: 5200,
        monthlyOperatingCostSeK: 0,
        monthlyBudgetCostSeK: 0,
        monthlyAmortizationSeK: 3000,
        monthlyPaymentSeK: 8000,
        monthlyEffectivePaymentSeK: 8200,
        requiredAmortizationRate: 0.02,
        totalInterestSeK: 1000000,
        totalCostSeK: 3000000,
        totalEffectiveInterestSeK: 1100000,
        totalEffectiveCostSeK: 3100000,
      },
    ]

    const { result } = renderHook(() => useBankComparisonView({ rows }))

    expect(result.current.hasRows).toBe(true)
    expect(result.current.portionHeaders).toEqual(rows[0].portionRates)
    expect(result.current.formatTerm(0.25)).toBe('3 mån')
    expect(result.current.formatTerm(3)).toBe('3 år')
  })
})
