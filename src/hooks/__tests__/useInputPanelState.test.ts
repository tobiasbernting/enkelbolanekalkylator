// import { act, renderHook } from '@testing-library/react'
// import { describe, expect, it, vi } from 'vitest'
// import { useInputPanelState } from '../useInputPanelState'

// function normalizeSpaces(value: string): string {
//   return value.replace(/\s|\u00A0/g, ' ').replace(/ +/g, ' ').trim()
// }

// describe('useInputPanelState', () => {
//   it('parses formatted numeric input and exposes formatted values', () => {
//     const onHousePriceChange = vi.fn()
//     const onDownPaymentChange = vi.fn()
//     const onMonthlyIncomeChange = vi.fn()
//     const onMonthlyAmortizationChange = vi.fn()
//     const onMonthlyAmortizationModeChange = vi.fn()
//     const onDownPaymentModeChange = vi.fn()

//     const { result } = renderHook(() =>
//       useInputPanelState({
//         housePrice: 3300000,
//         downPayment: 400000,
//         monthlyIncome: 95000,
//         monthlyAmortization: 5000,
//         minimumMonthlyAmortization: 5500,
//         isMonthlyAmortizationAuto: true,
//         onHousePriceChange,
//         onDownPaymentChange,
//         onMonthlyIncomeChange,
//         onMonthlyAmortizationChange,
//         onMonthlyAmortizationModeChange,
//         onDownPaymentModeChange,
//       })
//     )

//     expect(normalizeSpaces(result.current.housePriceFieldValue)).toBe('3 300 000')
//     expect(normalizeSpaces(result.current.monthlyIncomeFieldValue)).toBe('95 000')
//     expect(result.current.downPaymentPercent).toBeCloseTo(12.12, 2)

//     act(() => {
//       result.current.onHousePriceInputChange('3 450 000')
//       result.current.onMonthlyIncomeInputChange('100 500')
//       result.current.onDownPaymentInputChange('450 000')
//     })

//     expect(onHousePriceChange).toHaveBeenCalledWith(3450000)
//     expect(onMonthlyIncomeChange).toHaveBeenCalledWith(100500)
//     expect(onDownPaymentChange).toHaveBeenCalledWith(450000)
//   })

//   it('handles amortization touched state and switch callbacks', () => {
//     const onHousePriceChange = vi.fn()
//     const onDownPaymentChange = vi.fn()
//     const onMonthlyIncomeChange = vi.fn()
//     const onMonthlyAmortizationChange = vi.fn()
//     const onMonthlyAmortizationModeChange = vi.fn()
//     const onDownPaymentModeChange = vi.fn()

//     const { result } = renderHook(() =>
//       useInputPanelState({
//         housePrice: 3300000,
//         downPayment: 400000,
//         monthlyIncome: 95000,
//         monthlyAmortization: 5000,
//         minimumMonthlyAmortization: 5500,
//         isMonthlyAmortizationAuto: true,
//         onHousePriceChange,
//         onDownPaymentChange,
//         onMonthlyIncomeChange,
//         onMonthlyAmortizationChange,
//         onMonthlyAmortizationModeChange,
//         onDownPaymentModeChange,
//       })
//     )

//     expect(result.current.isAmortizationBelowMinimum).toBe(false)

//     act(() => {
//       result.current.onMonthlyAmortizationInputChange('5 000')
//     })

//     expect(onMonthlyAmortizationModeChange).toHaveBeenCalledWith(false)
//     expect(onMonthlyAmortizationChange).toHaveBeenCalledWith(5000)
//     expect(result.current.isAmortizationBelowMinimum).toBe(true)

//     act(() => {
//       result.current.onAmortizationModeSwitchChange(false)
//       result.current.onDownPaymentModeSwitchChange(true)
//       result.current.onDownPaymentPercentChange('20')
//     })

//     expect(onMonthlyAmortizationModeChange).toHaveBeenCalledWith(true)
//     expect(onDownPaymentModeChange).toHaveBeenCalledWith('percentage')
//     expect(onDownPaymentChange).toHaveBeenCalledWith(660000)
//   })
// })
