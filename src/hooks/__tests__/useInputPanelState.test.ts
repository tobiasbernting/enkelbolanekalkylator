import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useInputPanelState } from '../useInputPanelState'

function normalizeSpaces(value: string): string {
	return value.replace(/\s|\u00A0/g, ' ').replace(/ +/g, ' ').trim()
}

describe('useInputPanelState', () => {
	it('parses formatted numeric input and exposes formatted values', () => {
		const onHousePriceChange = vi.fn()
		const onDownPaymentChange = vi.fn()
		const onMonthlyIncomeChange = vi.fn()
		const onMonthlyAmortizationChange = vi.fn()
		const onMonthlyOperatingCostChange = vi.fn()
		const onMonthlyAmortizationModeChange = vi.fn()
		const onDownPaymentModeChange = vi.fn()

		const { result } = renderHook(() =>
			useInputPanelState({
				housePrice: 3300000,
				downPayment: 400000,
				monthlyIncome: 95000,
				monthlyAmortization: 5000,
				monthlyOperatingCost: 2500,
				minimumMonthlyAmortization: 5500,
				isMonthlyAmortizationAuto: true,
				onHousePriceChange,
				onDownPaymentChange,
				onMonthlyIncomeChange,
				onMonthlyAmortizationChange,
				onMonthlyOperatingCostChange,
				onMonthlyAmortizationModeChange,
				onDownPaymentModeChange,
			})
		)

		expect(normalizeSpaces(result.current.housePriceFieldValue)).toBe('3 300 000')
		expect(normalizeSpaces(result.current.monthlyIncomeFieldValue)).toBe('95 000')
		expect(normalizeSpaces(result.current.monthlyOperatingCostFieldValue)).toBe('2 500')
		expect(result.current.downPaymentPercent).toBeCloseTo(12.12, 2)

		act(() => {
			result.current.onHousePriceInputChange('3 450 000')
			result.current.onMonthlyIncomeInputChange('100 500')
			result.current.onDownPaymentInputChange('450 000')
			result.current.onMonthlyOperatingCostInputChange('3 000')
		})

		expect(onHousePriceChange).toHaveBeenCalledWith(3450000)
		expect(onMonthlyIncomeChange).toHaveBeenCalledWith(100500)
		expect(onDownPaymentChange).toHaveBeenCalledWith(450000)
		expect(onMonthlyOperatingCostChange).toHaveBeenCalledWith(3000)
	})

	it('handles amortization touched state and switch callbacks', () => {
		const onHousePriceChange = vi.fn()
		const onDownPaymentChange = vi.fn()
		const onMonthlyIncomeChange = vi.fn()
		const onMonthlyAmortizationChange = vi.fn()
		const onMonthlyOperatingCostChange = vi.fn()
		const onMonthlyAmortizationModeChange = vi.fn()
		const onDownPaymentModeChange = vi.fn()

		const { result } = renderHook(() =>
			useInputPanelState({
				housePrice: 3300000,
				downPayment: 400000,
				monthlyIncome: 95000,
				monthlyAmortization: 5000,
				monthlyOperatingCost: 2500,
				minimumMonthlyAmortization: 5500,
				isMonthlyAmortizationAuto: true,
				onHousePriceChange,
				onDownPaymentChange,
				onMonthlyIncomeChange,
				onMonthlyAmortizationChange,
				onMonthlyOperatingCostChange,
				onMonthlyAmortizationModeChange,
				onDownPaymentModeChange,
			})
		)

		expect(result.current.isAmortizationBelowMinimum).toBe(false)

		act(() => {
			result.current.onMonthlyAmortizationInputChange('5 000')
		})

		expect(onMonthlyAmortizationModeChange).toHaveBeenCalledWith(false)
		expect(onMonthlyAmortizationChange).toHaveBeenCalledWith(5000)
		expect(result.current.isAmortizationBelowMinimum).toBe(true)

		act(() => {
			result.current.onAmortizationModeSwitchChange(false)
			result.current.onDownPaymentModeSwitchChange(true)
			result.current.onDownPaymentPercentChange('20')
		})

		expect(onMonthlyAmortizationModeChange).toHaveBeenCalledWith(true)
		expect(onDownPaymentModeChange).toHaveBeenCalledWith('percentage')
		expect(onDownPaymentChange).toHaveBeenCalledWith(660000)
	})
})

describe('useInputPanelState bolånetak', () => {
	const noop = () => {}
	const baseParams = {
		housePrice: 3000000,
		monthlyIncome: 0,
		monthlyAmortization: 0,
		monthlyOperatingCost: 0,
		minimumMonthlyAmortization: 0,
		isMonthlyAmortizationAuto: true,
		onHousePriceChange: noop,
		onDownPaymentChange: noop,
		onMonthlyIncomeChange: noop,
		onMonthlyAmortizationChange: noop,
		onMonthlyOperatingCostChange: noop,
		onMonthlyAmortizationModeChange: noop,
		onDownPaymentModeChange: noop,
	}

	it('warns when a new loan is above 90% of the price', () => {
		const { result } = renderHook(() => useInputPanelState({ ...baseParams, downPayment: 299999 }))
		expect(result.current.minimumDownPaymentSeK).toBe(300000)
		expect(result.current.isAboveMortgageCap).toBe(true)
	})

	it('accepts exactly 10% down payment and ignores the cap for existing loans', () => {
		const atCap = renderHook(() => useInputPanelState({ ...baseParams, downPayment: 300000 }))
		expect(atCap.result.current.isAboveMortgageCap).toBe(false)

		const existing = renderHook(() =>
			useInputPanelState({ ...baseParams, loanMode: 'existing', downPayment: 100000 })
		)
		expect(existing.result.current.isAboveMortgageCap).toBe(false)
	})
})
