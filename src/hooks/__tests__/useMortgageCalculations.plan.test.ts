import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useMortgageCalculations } from '../useMortgageCalculations'

// 800 000 kr on a 1 000 000 kr home (80 %), 6 % rate.
const baseParams = {
  housePrice: 1000000,
  downPayment: 200000,
  monthlyIncome: 0,
  monthlyOperatingCost: 0,
  monthlyBudgetItems: [],
  selectedBank: '',
  selectedRateType: 'average' as const,
  numberOfBorrowers: 1 as const,
  loanPortions: [{ id: 'p1', bankId: '', amountSeK: 800000, termYears: 0.25, interestRate: 6 }],
}

describe('useMortgageCalculations plan', () => {
  it('moves the 70 % milestone when amortization changes', () => {
    const { result, rerender } = renderHook((props: { amortization: number }) =>
      useMortgageCalculations({
        ...baseParams,
        monthlyAmortization: props.amortization,
        isMonthlyAmortizationUserSet: true,
      }),
      { initialProps: { amortization: 2000 } }
    )

    // 100 000 kr to amortize to reach 70 %: 50 months at 2 000 kr.
    expect(result.current.projection.milestoneMonths.below70).toBe(50)
    expect(result.current.effectiveMonthlyAmortization).toBe(2000)

    rerender({ amortization: 5000 })

    expect(result.current.projection.milestoneMonths.below70).toBe(20)
    expect(result.current.effectiveMonthlyAmortization).toBe(5000)
    // The reference plan (amorteringskravet: 1 333 kr/mån) is unaffected.
    expect(result.current.baselineProjection.milestoneMonths.below70).toBe(75)
  })

  it('applies the rate change to interest, rates and the plan but not to the bank comparison', () => {
    const { result } = renderHook(() =>
      useMortgageCalculations({
        ...baseParams,
        monthlyAmortization: 0,
        rateChangePercentPoints: 1,
      })
    )

    expect(result.current.selectedNominalRatePercent).toBeCloseTo(7, 9)
    expect(result.current.loanCalculation.monthlyPaymentSeK).toBeCloseTo(800000 * 0.07 / 12, 6)
    expect(result.current.projection.months[0].interestSeK).toBeCloseTo(800000 * 0.07 / 12, 6)
    expect(result.current.baselineProjection.months[0].interestSeK).toBeCloseTo(800000 * 0.06 / 12, 6)
  })
})
