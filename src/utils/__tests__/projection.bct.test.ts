import { describe, expect, it } from 'vitest'
import {
  applyRateChange,
  calculateYearlyInterestDeduction,
  projectMortgage,
  type LoanPortion,
} from '../calculations'

// 800 000 kr loan on a 1 000 000 kr home = 80 % belåningsgrad, 6 % rate (0,5 % per month).
const portions: LoanPortion[] = [
  { id: 'a', bankId: '', amountSeK: 500000, termYears: 0.25, interestRate: 6 },
  { id: 'b', bankId: '', amountSeK: 300000, termYears: 3, interestRate: 6 },
]

describe('BCT: projectMortgage', () => {
  it('follows amorteringskravet and steps it down at 70 % and 50 %', () => {
    const projection = projectMortgage({
      portions,
      housePriceSeK: 1000000,
      amortizationMode: 'requirement',
      fixedMonthlyAmortizationSeK: 0,
      enforceRequirement: true,
    })

    // 2 % of 800 000 = 16 000 kr/år = 1 333,33 kr/mån until the loan is 700 000 kr:
    // 100 000 / 1 333,33 = 75 months.
    expect(projection.months[0].amortizationSeK).toBeCloseTo(1333.33, 2)
    expect(projection.milestoneMonths.below70).toBe(75)
    // Then 1 % of 800 000 = 666,67 kr/mån for 200 000 kr more: 300 months.
    expect(projection.months[75].amortizationSeK).toBeCloseTo(666.67, 2)
    expect(projection.milestoneMonths.below50).toBe(375)
    // Below 50 % there is no requirement, so the loan is never paid off.
    expect(projection.milestoneMonths.debtFree).toBeNull()
    expect(projection.isTruncated).toBe(true)
  })

  it('pays a fixed amount for an existing loan, even below the requirement', () => {
    const projection = projectMortgage({
      portions,
      housePriceSeK: 1000000,
      amortizationMode: 'fixed',
      fixedMonthlyAmortizationSeK: 2000,
      enforceRequirement: false,
    })

    // 100 000 / 2 000 = 50 months to 70 %, 300 000 / 2 000 = 150 to 50 %, 400 to debt free.
    expect(projection.milestoneMonths).toEqual({ below70: 50, below50: 150, debtFree: 400 })
    expect(projection.months[0].paymentSeK).toBeCloseTo(4000 + 2000, 6)
    // Interest = 0,5 % × (sum of opening balances) = 0,005 × (400 × 800 000 − 2 000 × 400 × 399 / 2).
    expect(projection.totalInterestSeK).toBeCloseTo(0.005 * (400 * 800000 - (2000 * 400 * 399) / 2), 2)
    expect(projection.years[0].amortizationSeK).toBeCloseTo(24000, 6)
    expect(projection.years[4].milestones).toEqual(['below70'])
    expect(projection.isTruncated).toBe(false)
  })

  it('never lets a new loan amortize less than the requirement', () => {
    const projection = projectMortgage({
      portions,
      housePriceSeK: 1000000,
      amortizationMode: 'fixed',
      fixedMonthlyAmortizationSeK: 500,
      enforceRequirement: true,
    })

    expect(projection.months[0].amortizationSeK).toBeCloseTo(1333.33, 2)
  })

  it('marks milestones already passed as month 0', () => {
    const projection = projectMortgage({
      portions,
      housePriceSeK: 2000000,
      amortizationMode: 'requirement',
      fixedMonthlyAmortizationSeK: 0,
      enforceRequirement: true,
    })

    expect(projection.initialLoanToValue).toBeCloseTo(0.4, 9)
    expect(projection.milestoneMonths.below70).toBe(0)
    expect(projection.milestoneMonths.below50).toBe(0)
  })
})

describe('BCT: applyRateChange', () => {
  it('shifts every portion and never goes below 0 %', () => {
    const changed = applyRateChange(portions, -7)
    expect(changed.map((p) => p.interestRate)).toEqual([0, 0])
    expect(applyRateChange(portions, 1).map((p) => p.interestRate)).toEqual([7, 7])
    expect(applyRateChange(portions, 0)).toBe(portions)
  })
})

describe('BCT: ränteavdrag', () => {
  it('gives 30 % up to 100 000 kr and 21 % above, per borrower', () => {
    expect(calculateYearlyInterestDeduction(80000, 1)).toBeCloseTo(24000, 6)
    expect(calculateYearlyInterestDeduction(150000, 1)).toBeCloseTo(30000 + 10500, 6)
    expect(calculateYearlyInterestDeduction(150000, 2)).toBeCloseTo(45000, 6)
  })
})
