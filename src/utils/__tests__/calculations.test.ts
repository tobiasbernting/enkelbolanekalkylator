import { describe, expect, it } from 'vitest'
import {
  calculateLoan,
  calculateMonthlyPayment,
  calculateMultipleLoans,
  calculatePortionDetail,
  formatCurrency,
  formatPercent,
  generateAmortizationSchedule,
  generateCombinedAmortizationSchedule,
  generateScenarios,
  type LoanPortion,
} from '../calculations'

describe('calculations', () => {
  it('calculates monthly payment for key edge cases and standard loan', () => {
    expect(calculateMonthlyPayment(0, 4, 30)).toBe(0)
    expect(calculateMonthlyPayment(1000000, 0, 30)).toBeCloseTo(2777.78, 2)
    expect(calculateMonthlyPayment(1000000, 5, 30)).toBeCloseTo(5368.22, 2)
  })

  it('calculates and clamps loan values', () => {
    const normalLoan = calculateLoan(2000000, 300000, 4, 30)
    const overpaidLoan = calculateLoan(1000000, 1200000, 4, 30)

    expect(normalLoan.loanAmountSeK).toBe(1700000)
    expect(normalLoan.monthlyPaymentSeK).toBeGreaterThan(0)
    expect(normalLoan.totalCostSeK).toBeGreaterThan(2000000)

    expect(overpaidLoan.loanAmountSeK).toBe(0)
    expect(overpaidLoan.monthlyPaymentSeK).toBe(0)
    expect(overpaidLoan.totalInterestSeK).toBe(0)
    expect(overpaidLoan.totalCostSeK).toBe(1000000)
  })

  it('calculates portion detail and aggregates multiple portions', () => {
    const portions: LoanPortion[] = [
      {
        id: 'a',
        bankId: 'sbab',
        amountSeK: 1000000,
        termYears: 3,
        interestRate: 3.6,
      },
      {
        id: 'b',
        bankId: 'sbab',
        amountSeK: 500000,
        termYears: 5,
        interestRate: 3.0,
      },
    ]

    const detail = calculatePortionDetail(portions[0])
    const multi = calculateMultipleLoans(2500000, 500000, portions)
    const empty = calculateMultipleLoans(2500000, 500000, [])

    expect(detail.monthlyPaymentSeK).toBeCloseTo(3000, 6)
    expect(detail.totalInterestSeK).toBeCloseTo(108000, 6)

    expect(multi.amountToFinanceSeK).toBe(2000000)
    expect(multi.totalLoanAmountSeK).toBe(1500000)
    expect(multi.totalMonthlyPaymentSeK).toBeCloseTo(4250, 6)
    expect(multi.portionDetails).toHaveLength(2)

    expect(empty.totalLoanAmountSeK).toBe(0)
    expect(empty.totalMonthlyPaymentSeK).toBe(0)
    expect(empty.portionDetails).toEqual([])
  })

  it('generates yearly amortization schedule for valid and invalid input', () => {
    const invalid = generateAmortizationSchedule(0, 4, 30)
    const schedule = generateAmortizationSchedule(120000, 0, 10)

    expect(invalid).toEqual([])
    expect(schedule).toHaveLength(10)
    expect(schedule[0].annualPrincipalSeK).toBeCloseTo(12000, 6)
    expect(schedule[0].remainingBalanceSeK).toBeCloseTo(108000, 6)
    expect(schedule[schedule.length - 1]?.remainingBalanceSeK).toBeCloseTo(0, 6)
  })

  it('generates combined amortization schedule and respects minimum amortization floor', () => {
    const noPortions = generateCombinedAmortizationSchedule([], 1000000, 600000)
    const portions: LoanPortion[] = [
      {
        id: 'a',
        bankId: 'sbab',
        amountSeK: 120000,
        termYears: 3,
        interestRate: 0,
      },
    ]
    const schedule = generateCombinedAmortizationSchedule(
      portions,
      1000000,
      600000,
      20,
      2000
    )

    expect(noPortions).toEqual([])
    expect(schedule).toHaveLength(5)
    expect(schedule[0].annualPrincipalSeK).toBeCloseTo(24000, 6)
    expect(schedule[schedule.length - 1]?.remainingBalanceSeK).toBeCloseTo(0, 6)
  })

  it('generates scenario matrix, clamps negative loans and applies monthly amortization floor', () => {
    const scenarios = generateScenarios(
      1000000,
      [-50000, 700000],
      [0, 3],
      30,
      300000,
      1000
    )

    expect(scenarios).toHaveLength(4)
    expect(scenarios[0].loanAmountSeK).toBe(0)
    expect(scenarios[0].downPaymentSeK).toBe(1000000)

    const seventyPercentAtZeroRate = scenarios.find(
      (scenario) => scenario.loanAmountSeK === 700000 && scenario.interestRate === 0
    )

    expect(seventyPercentAtZeroRate).toBeDefined()
    expect(seventyPercentAtZeroRate?.amortizationRate).toBe(0.01)
    expect(seventyPercentAtZeroRate?.monthlyAmortizationSeK).toBe(1000)
    expect(seventyPercentAtZeroRate?.monthlyPaymentSeK).toBe(1000)
  })

  it('formats currency and percentages', () => {
    const formattedCurrency = formatCurrency(1234.56)

    expect(formattedCurrency).toContain('kr')
    expect(formatPercent(1.236)).toBe('1.24%')
  })
})
