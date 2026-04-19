import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useMortgageCalculations } from '../useMortgageCalculations'
import type { LoanPortion } from '../../utils/calculations'

describe('BCT: useMortgageCalculations', () => {
	it('uses financing need (house - down payment) as amortization rule basis', () => {
		const partialPortions: LoanPortion[] = [
			{
				id: 'portion-1',
				bankId: 'sbab',
				amountSeK: 1000000,
				termYears: 3,
				interestRate: 3.2,
			},
		]

		const { result } = renderHook(() =>
			useMortgageCalculations({
				housePrice: 3300000,
				downPayment: 400000,
				monthlyIncome: 95000,
				monthlyAmortization: 0,
				monthlyOperatingCost: 0,
				monthlyBudgetItems: [],
				selectedBank: 'sbab',
				selectedRateType: 'average',
				numberOfBorrowers: 1,
				loanPortions: partialPortions,
			})
		)

		expect(result.current.requiredLoanAmountForRules).toBe(2900000)
		expect(result.current.requiredAmortizationRate).toBe(0.02)
		expect(result.current.requiredMonthlyAmortization).toBeCloseTo(4833.33, 2)
	})

	it('never uses monthly amortization below required amortization', () => {
		const { result } = renderHook(() =>
			useMortgageCalculations({
				housePrice: 2000000,
				downPayment: 200000,
				monthlyIncome: 60000,
				monthlyAmortization: 1000,
				monthlyOperatingCost: 0,
				monthlyBudgetItems: [],
				selectedBank: 'sbab',
				selectedRateType: 'average',
				numberOfBorrowers: 1,
				loanPortions: [],
			})
		)

		expect(result.current.requiredMonthlyAmortization).toBeGreaterThan(1000)
		expect(result.current.effectiveMonthlyAmortization).toBe(result.current.requiredMonthlyAmortization)
	})

	it('sorts bank comparison by monthly interest ascending', () => {
		const portions: LoanPortion[] = [
			{
				id: 'portion-1',
				bankId: 'sbab',
				amountSeK: 1200000,
				termYears: 3,
				interestRate: 3.0,
			},
			{
				id: 'portion-2',
				bankId: 'sbab',
				amountSeK: 800000,
				termYears: 5,
				interestRate: 3.3,
			},
		]

		const { result } = renderHook(() =>
			useMortgageCalculations({
				housePrice: 2600000,
				downPayment: 600000,
				monthlyIncome: 80000,
				monthlyAmortization: 5000,
				monthlyOperatingCost: 1500,
				monthlyBudgetItems: [
					{ id: 'budget-1', name: 'El', amountSeK: 1000 },
					{ id: 'budget-2', name: 'Internet', amountSeK: 500 },
				],
				selectedBank: 'sbab',
				selectedRateType: 'average',
				numberOfBorrowers: 1,
				loanPortions: portions,
			})
		)

		const interests = result.current.perBankSummary.map((row) => row.monthlyInterestSeK)

		expect(interests.length).toBeGreaterThan(1)
		for (let i = 1; i < interests.length; i++) {
			expect(interests[i]).toBeGreaterThanOrEqual(interests[i - 1])
		}
	})

	it('estimates yearly interest deduction from average yearly debt and splits per borrower', () => {
		const { result } = renderHook(() =>
			useMortgageCalculations({
				housePrice: 3700000,
				downPayment: 730000,
				monthlyIncome: 90000,
				monthlyAmortization: 5000,
				monthlyOperatingCost: 0,
				monthlyBudgetItems: [],
				selectedBank: 'seb',
				selectedRateType: 'average',
				numberOfBorrowers: 2,
				loanPortions: [
					{
						id: 'portion-1',
						bankId: 'seb',
						amountSeK: 2970000,
						termYears: 3,
						interestRate: 3.05,
					},
				],
			})
		)

		expect(result.current.selectedYearlyInterestDeductionPerBorrowerSeK).toBeCloseTo(13462, 0)
		expect(result.current.selectedYearlyInterestDeductionSeK).toBeCloseTo(26924, 0)
	})
})
