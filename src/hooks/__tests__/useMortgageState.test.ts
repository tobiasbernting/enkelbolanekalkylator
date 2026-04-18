import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useMortgageState } from '../useMortgageState'

describe('useMortgageState', () => {
  it('reads initial values from query params', () => {
    const params = new URLSearchParams({
      housePrice: '3500000',
      downPayment: '500000',
      monthlyIncome: '100000',
      monthlyAmortization: '7000',
      amortizationMode: 'manual',
      loanTerm: '10',
      bankId: 'swedbank',
      rateType: 'list',
      downPaymentMode: 'percentage',
      loanPortions: JSON.stringify([
        {
          id: 'portion-a',
          bankId: 'swedbank',
          amountSeK: 3000000,
          termYears: 3,
          interestRate: 3.2,
        },
      ]),
    })

    window.history.replaceState({}, '', `/?${params.toString()}`)

    const { result } = renderHook(() => useMortgageState())

    expect(result.current.state.housePrice).toBe(3500000)
    expect(result.current.state.downPayment).toBe(500000)
    expect(result.current.state.monthlyIncome).toBe(100000)
    expect(result.current.state.monthlyAmortization).toBe(7000)
    expect(result.current.state.isMonthlyAmortizationUserSet).toBe(true)
    expect(result.current.state.loanTerm).toBe(10)
    expect(result.current.state.selectedBank).toBe('swedbank')
    expect(result.current.state.selectedRateType).toBe('list')
    expect(result.current.state.downPaymentMode).toBe('percentage')
    expect(result.current.state.loanPortions).toHaveLength(1)
  })

  it('writes changes to query params and can reset to defaults', async () => {
    window.history.replaceState({}, '', '/')

    const { result } = renderHook(() => useMortgageState())

    act(() => {
      result.current.actions.setHousePrice(3600000)
      result.current.actions.setDownPayment(600000)
      result.current.actions.setMonthlyIncome(90000)
      result.current.actions.setMonthlyAmortization(5500)
      result.current.actions.setIsMonthlyAmortizationUserSet(true)
      result.current.actions.setSelectedBank('nordea')
      result.current.actions.setSelectedRateType('list')
      result.current.actions.setDownPaymentMode('percentage')
    })

    await waitFor(() => {
      const searchParams = new URLSearchParams(window.location.search)
      expect(searchParams.get('housePrice')).toBe('3600000')
      expect(searchParams.get('bankId')).toBe('nordea')
      expect(searchParams.get('rateType')).toBe('list')
      expect(searchParams.get('downPaymentMode')).toBe('percentage')
      expect(searchParams.get('amortizationMode')).toBe('manual')
    })

    act(() => {
      result.current.actions.reset()
    })

    await waitFor(() => {
      expect(result.current.state.housePrice).toBe(2000000)
      expect(result.current.state.downPayment).toBe(400000)
      expect(result.current.state.monthlyIncome).toBe(0)
      expect(result.current.state.monthlyAmortization).toBe(0)
      expect(result.current.state.selectedBank).toBe('sbab')
      expect(result.current.state.selectedRateType).toBe('average')
      expect(result.current.state.downPaymentMode).toBe('amount')
    })
  })
})
