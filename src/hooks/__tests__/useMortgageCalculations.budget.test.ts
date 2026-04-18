import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useMortgageCalculations } from '../useMortgageCalculations'

describe('useMortgageCalculations with monthly budget', () => {
  it('adds budget total to combined monthly cost', () => {
    const { result } = renderHook(() =>
      useMortgageCalculations({
        housePrice: 2500000,
        downPayment: 500000,
        monthlyIncome: 70000,
        monthlyAmortization: 4000,
        monthlyOperatingCost: 2000,
        monthlyBudgetItems: [
          { id: 'a', name: 'El', amountSeK: 1000 },
          { id: 'b', name: 'Internet', amountSeK: 500 },
        ],
        selectedBank: 'sbab',
        selectedRateType: 'average',
        loanPortions: [],
      })
    )

    expect(result.current.monthlyBudgetCostSeK).toBe(1500)
    expect(result.current.totalMonthlyCost).toBeCloseTo(
      result.current.mortgageMonthlyCostSeK + result.current.monthlyBudgetCostSeK,
      6
    )
  })

  it('ignores negative budget amounts in total', () => {
    const { result } = renderHook(() =>
      useMortgageCalculations({
        housePrice: 2500000,
        downPayment: 500000,
        monthlyIncome: 70000,
        monthlyAmortization: 4000,
        monthlyOperatingCost: 2000,
        monthlyBudgetItems: [
          { id: 'a', name: 'El', amountSeK: -1000 },
          { id: 'b', name: 'Internet', amountSeK: 500 },
        ],
        selectedBank: 'sbab',
        selectedRateType: 'average',
        loanPortions: [],
      })
    )

    expect(result.current.monthlyBudgetCostSeK).toBe(500)
  })
})
