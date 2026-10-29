import { describe, expect, it } from 'vitest'
import { calculateWhatIf, calculateYearlyInterestDeduction, type LoanPortion } from '../calculations'

const portions: LoanPortion[] = [
  { id: 'a', bankId: '', amountSeK: 2000000, termYears: 0.25, interestRate: 3 },
]

describe('BCT: what-if for interest rate and amortization changes', () => {
  it('shows no difference when nothing changes', () => {
    const result = calculateWhatIf({
      portions,
      rateChangePercentPoints: 0,
      currentMonthlyAmortizationSeK: 3333,
      newMonthlyAmortizationSeK: 3333,
      numberOfBorrowers: 1,
    })

    expect(result.current.monthlyInterestSeK).toBeCloseTo(5000, 6)
    expect(result.monthlyPaymentDeltaSeK).toBe(0)
    expect(result.monthlyNetPaymentDeltaSeK).toBe(0)
  })

  it('raises interest cost by about 1 667 kr/mån when the rate goes up 1 %-enhet on 2 Mkr', () => {
    const result = calculateWhatIf({
      portions,
      rateChangePercentPoints: 1,
      currentMonthlyAmortizationSeK: 3333,
      newMonthlyAmortizationSeK: 3333,
      numberOfBorrowers: 1,
    })

    // 2 000 000 × 1 % / 12 = 1 666.67 kr more interest per month.
    expect(result.scenario.averageRatePercent).toBeCloseTo(4, 6)
    expect(result.monthlyPaymentDeltaSeK).toBeCloseTo(1666.67, 2)
    // Yearly interest 60 000 → 80 000 kr, under the 100 000 kr threshold: 30 % deduction.
    expect(result.yearlyNetPaymentDeltaSeK).toBeCloseTo(20000 * 0.7, 2)
  })

  it('never lets the rate go below zero', () => {
    const result = calculateWhatIf({
      portions,
      rateChangePercentPoints: -5,
      currentMonthlyAmortizationSeK: 0,
      newMonthlyAmortizationSeK: 0,
      numberOfBorrowers: 1,
    })

    expect(result.scenario.monthlyInterestSeK).toBe(0)
  })

  it('computes debt-free time and total interest for straight amortization', () => {
    const result = calculateWhatIf({
      portions: [{ id: 'a', bankId: '', amountSeK: 120000, termYears: 1, interestRate: 12 }],
      rateChangePercentPoints: 0,
      currentMonthlyAmortizationSeK: 10000,
      newMonthlyAmortizationSeK: 20000,
      numberOfBorrowers: 1,
    })

    // 1 % per month on balances 120k, 110k, ..., 10k = 780 000 × 1 % = 7 800 kr.
    expect(result.current.monthsToDebtFree).toBe(12)
    expect(result.current.totalInterestUntilDebtFreeSeK).toBeCloseTo(7800, 6)
    // 120k, 100k, ..., 20k = 420 000 × 1 % = 4 200 kr.
    expect(result.scenario.monthsToDebtFree).toBe(6)
    expect(result.scenario.totalInterestUntilDebtFreeSeK).toBeCloseTo(4200, 6)
  })

  it('reports no payoff date without amortization', () => {
    const result = calculateWhatIf({
      portions,
      rateChangePercentPoints: 0,
      currentMonthlyAmortizationSeK: 3000,
      newMonthlyAmortizationSeK: 0,
      numberOfBorrowers: 1,
    })

    expect(result.scenario.monthsToDebtFree).toBeNull()
    expect(result.scenario.totalInterestUntilDebtFreeSeK).toBeNull()
    expect(result.monthlyPaymentDeltaSeK).toBe(-3000)
  })
})

describe('BCT: ränteavdrag', () => {
  it('gives 30 % up to 100 000 kr and 21 % above, per borrower', () => {
    expect(calculateYearlyInterestDeduction(80000, 1)).toBeCloseTo(24000, 6)
    expect(calculateYearlyInterestDeduction(150000, 1)).toBeCloseTo(30000 + 10500, 6)
    expect(calculateYearlyInterestDeduction(150000, 2)).toBeCloseTo(45000, 6)
  })
})
