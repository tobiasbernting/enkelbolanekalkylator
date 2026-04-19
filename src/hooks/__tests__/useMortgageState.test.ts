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
      monthlyOperatingCost: '2500',
      amortizationMode: 'manual',
      loanTerm: '10',
      bankId: 'swedbank',
      rateType: 'list',
      numberOfBorrowers: '2',
      downPaymentMode: 'percentage',
      monthlyBudgetItems: JSON.stringify([
        {
          id: 'budget-a',
          name: 'El',
          amountSeK: 800,
        },
      ]),
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
    expect(result.current.state.monthlyOperatingCost).toBe(2500)
    expect(result.current.state.monthlyBudgetItems).toHaveLength(1)
    expect(result.current.state.monthlyBudgetItems[0]).toMatchObject({
      name: 'El',
      amountSeK: 800,
    })
    expect(result.current.state.isMonthlyAmortizationUserSet).toBe(true)
    expect(result.current.state.loanTerm).toBe(10)
    expect(result.current.state.selectedBank).toBe('swedbank')
    expect(result.current.state.selectedRateType).toBe('list')
    expect(result.current.state.numberOfBorrowers).toBe(2)
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
      result.current.actions.setMonthlyOperatingCost(3200)
      result.current.actions.setMonthlyBudgetItems([
        { id: 'b1', name: 'Internet', amountSeK: 500 },
        { id: 'b2', name: 'Forsakring', amountSeK: 900 },
      ])
      result.current.actions.setIsMonthlyAmortizationUserSet(true)
      result.current.actions.setSelectedBank('nordea')
      result.current.actions.setSelectedRateType('list')
      result.current.actions.setNumberOfBorrowers(2)
      result.current.actions.setDownPaymentMode('percentage')
    })

    await waitFor(() => {
      const searchParams = new URLSearchParams(window.location.search)
      expect(searchParams.get('housePrice')).toBe('3600000')
      expect(searchParams.get('bankId')).toBe('nordea')
      expect(searchParams.get('rateType')).toBe('list')
      expect(searchParams.get('numberOfBorrowers')).toBe('2')
      expect(searchParams.get('downPaymentMode')).toBe('percentage')
      expect(searchParams.get('amortizationMode')).toBe('manual')
      expect(searchParams.get('monthlyOperatingCost')).toBe('3200')
      expect(searchParams.get('monthlyBudgetItems')).toBe(
        '[{"id":"b1","name":"Internet","amountSeK":500},{"id":"b2","name":"Forsakring","amountSeK":900}]'
      )
    })

    act(() => {
      result.current.actions.reset()
    })

    await waitFor(() => {
      expect(result.current.state.housePrice).toBe(2000000)
      expect(result.current.state.downPayment).toBe(400000)
      expect(result.current.state.monthlyIncome).toBe(0)
      expect(result.current.state.monthlyAmortization).toBe(0)
      expect(result.current.state.monthlyOperatingCost).toBe(0)
      expect(result.current.state.monthlyBudgetItems).toHaveLength(0)
      expect(result.current.state.selectedBank).toBe('sbab')
      expect(result.current.state.selectedRateType).toBe('average')
      expect(result.current.state.numberOfBorrowers).toBe(1)
      expect(result.current.state.downPaymentMode).toBe('amount')
    })
  })

  it('rebalances loan portions when financing amount changes', async () => {
    window.history.replaceState({}, '', '/')

    const { result } = renderHook(() => useMortgageState())

    act(() => {
      result.current.actions.setLoanPortions([
        {
          id: 'portion-1',
          bankId: 'sbab',
          amountSeK: 1000000,
          termYears: 3,
          interestRate: 3.1,
        },
        {
          id: 'portion-2',
          bankId: 'sbab',
          amountSeK: 600000,
          termYears: 5,
          interestRate: 3.2,
        },
      ])
    })

    act(() => {
      result.current.actions.setDownPayment(500000)
    })

    await waitFor(() => {
      const sum = result.current.state.loanPortions.reduce(
        (total, portion) => total + portion.amountSeK,
        0
      )

      expect(sum).toBe(1500000)
      expect(result.current.state.loanPortions[0].amountSeK).toBe(937500)
      expect(result.current.state.loanPortions[1].amountSeK).toBe(562500)
    })
  })
})
