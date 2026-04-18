import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useScenarioComparison } from '../useScenarioComparison'
import type { LoanPortion } from '../../utils/calculations'

describe('useScenarioComparison', () => {
  it('applies shift only to 3-month portion and leaves other terms unchanged', () => {
    const loanPortions: LoanPortion[] = [
      {
        id: 'rörlig-3m',
        bankId: 'sbab',
        amountSeK: 1200000,
        termYears: 0.25,
        interestRate: 2.9,
      },
      {
        id: 'bunden-1y',
        bankId: 'sbab',
        amountSeK: 800000,
        termYears: 1,
        interestRate: 3.1,
      },
    ]

    const { result } = renderHook(() =>
      useScenarioComparison({
        loanPortions,
        monthlyAmortizationSeK: 5000,
        selectedBank: 'sbab',
        selectedRateType: 'average',
      })
    )

    const portion3m = result.current.sortedPortions.find((p) => p.termYears === 0.25)
    const portion1y = result.current.sortedPortions.find((p) => p.termYears === 1)

    expect(portion3m).toBeDefined()
    expect(portion1y).toBeDefined()

    const base3m = result.current.getBaseRateForPortion(portion3m!)
    const base1y = result.current.getBaseRateForPortion(portion1y!)

    act(() => {
      result.current.onRateShiftChange(1.96)
    })

    const adjusted3m = result.current.getAdjustedRateForPortion(portion3m!)
    const adjusted1y = result.current.getAdjustedRateForPortion(portion1y!)

    expect(adjusted3m).toBeCloseTo(base3m + 1.96, 6)
    expect(adjusted1y).toBeCloseTo(base1y, 6)
  })

  it('builds historical scenarios and keeps non-3-month rates fixed', () => {
    const loanPortions: LoanPortion[] = [
      {
        id: 'rörlig-3m',
        bankId: 'sbab',
        amountSeK: 1000000,
        termYears: 0.25,
        interestRate: 2.5,
      },
      {
        id: 'bunden-1y',
        bankId: 'sbab',
        amountSeK: 1000000,
        termYears: 1,
        interestRate: 3.2,
      },
    ]

    const { result } = renderHook(() =>
      useScenarioComparison({
        loanPortions,
        monthlyAmortizationSeK: 5000,
        selectedBank: 'sbab',
        selectedRateType: 'average',
      })
    )

    expect(result.current.historicalScenarios.length).toBeGreaterThan(0)

    const inflationScenario = result.current.historicalScenarios.find(
      (scenario) => scenario.id === 'inflationschock-2023'
    )

    expect(inflationScenario).toBeDefined()
    expect(inflationScenario?.deltaPercentPoints).not.toBe(0)

    const portion1y = result.current.sortedPortions.find((p) => p.termYears === 1)
    expect(portion1y).toBeDefined()

    const base1y = result.current.getBaseRateForPortion(portion1y!)
    const adjusted1y = result.current.getAdjustedRateForPortion(portion1y!)
    expect(adjusted1y).toBeCloseTo(base1y, 6)
  })
})
