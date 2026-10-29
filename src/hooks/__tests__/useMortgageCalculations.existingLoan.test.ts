import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useMortgageCalculations } from '../useMortgageCalculations'
import type { LoanPortion } from '../../utils/calculations'

// SBAB's preset 3-month rate differs from this custom rate, so the test fails
// if the bank preset leaks into "your" rate.
const customPortions: LoanPortion[] = [
  { id: 'p1', bankId: 'sbab', amountSeK: 2400000, termYears: 0.25, interestRate: 2.1 },
]

const baseParams = {
  housePrice: 4000000,
  downPayment: 1600000,
  monthlyIncome: 0,
  monthlyOperatingCost: 0,
  monthlyBudgetItems: [],
  selectedBank: 'sbab',
  selectedRateType: 'average' as const,
  numberOfBorrowers: 1 as const,
  loanPortions: customPortions,
}

describe('useMortgageCalculations for an existing loan', () => {
  it('uses the entered interest rate, not the bank preset, for rate and deduction', () => {
    const { result } = renderHook(() =>
      useMortgageCalculations({ ...baseParams, monthlyAmortization: 0 })
    )

    expect(result.current.selectedNominalRatePercent).toBeCloseTo(2.1, 6)
    expect(result.current.loanCalculation.monthlyPaymentSeK).toBeCloseTo(4200, 6)
    // Effective rate from monthly compounding of 2.1 %.
    expect(result.current.selectedEffectiveRatePercent).toBeCloseTo((Math.pow(1 + 0.021 / 12, 12) - 1) * 100, 6)
  })

  it('keeps manual amortization below the requirement for an existing loan', () => {
    const { result } = renderHook(() =>
      useMortgageCalculations({
        ...baseParams,
        monthlyAmortization: 1000,
        loanMode: 'existing',
        isMonthlyAmortizationUserSet: true,
      })
    )

    // 60 % LTV → 1 % → 2 000 kr/mån required for a new loan.
    expect(result.current.requiredMonthlyAmortization).toBeCloseTo(2000, 6)
    expect(result.current.effectiveMonthlyAmortization).toBe(1000)
  })

  it('still enforces the requirement for a new loan', () => {
    const { result } = renderHook(() =>
      useMortgageCalculations({
        ...baseParams,
        monthlyAmortization: 1000,
        loanMode: 'new',
        isMonthlyAmortizationUserSet: true,
      })
    )

    expect(result.current.effectiveMonthlyAmortization).toBeCloseTo(2000, 6)
  })
})
