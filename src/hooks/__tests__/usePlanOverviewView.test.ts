import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { usePlanOverviewView } from '../usePlanOverviewView'
import { projectMortgage } from '../../utils/calculations'

const portions = [{ id: 'p1', bankId: '', amountSeK: 800000, termYears: 0.25, interestRate: 6 }]
const startDate = new Date(2026, 10, 1) // första betalningen i november 2026

describe('usePlanOverviewView', () => {
  it('shows milestone dates and how they compare with amorteringskravet', () => {
    const projection = projectMortgage({
      portions,
      housePriceSeK: 1000000,
      amortizationMode: 'fixed',
      fixedMonthlyAmortizationSeK: 2000,
      enforceRequirement: false,
    })
    const baselineProjection = projectMortgage({
      portions,
      housePriceSeK: 1000000,
      amortizationMode: 'requirement',
      fixedMonthlyAmortizationSeK: 0,
      enforceRequirement: true,
    })

    const { result } = renderHook(() =>
      usePlanOverviewView({
        projection,
        baselineProjection,
        startDate,
        monthlyInterestDeductionSeK: 1000,
        monthlyOperatingCostSeK: 0,
        monthlyBudgetCostSeK: 0,
      })
    )

    expect(result.current.monthlyPaymentSeK).toBeCloseTo(6000, 6)
    expect(result.current.monthlyNetPaymentSeK).toBeCloseTo(5000, 6)
    expect(result.current.currentLoanToValueLabel).toBe('80,0 %')

    const below70 = result.current.milestones.find((m) => m.key === 'below70')!
    // Month 50 counted from November 2026 = December 2030.
    expect(below70.value).toBe('december 2030')
    expect(below70.detail).toBe('om 4 år 2 mån')
    // 75 months with the requirement vs 50 here.
    expect(below70.comparison).toBe('2 år 1 mån tidigare än med amorteringskravet')

    const debtFree = result.current.milestones.find((m) => m.key === 'debtFree')!
    expect(debtFree.comparison).toBe('Nås inte med bara amorteringskravet')
    // A fixed plan never changes amortization because of the requirement.
    expect(result.current.nextChange).toBeNull()
  })

  it('tells when amorteringskravet steps down', () => {
    const projection = projectMortgage({
      portions,
      housePriceSeK: 1000000,
      amortizationMode: 'requirement',
      fixedMonthlyAmortizationSeK: 0,
      enforceRequirement: true,
    })

    const { result } = renderHook(() =>
      usePlanOverviewView({
        projection,
        baselineProjection: projection,
        startDate,
        monthlyInterestDeductionSeK: 0,
        monthlyOperatingCostSeK: 0,
        monthlyBudgetCostSeK: 0,
      })
    )

    // Below 70 % after payment 75, so payment 76 (February 2033) is the first at 1 %.
    expect(result.current.nextChange).toMatchObject({ dateLabel: 'februari 2033', isLower: true })
    expect(result.current.nextChange!.amortizationSeK).toBeCloseTo(666.67, 2)
  })
})
