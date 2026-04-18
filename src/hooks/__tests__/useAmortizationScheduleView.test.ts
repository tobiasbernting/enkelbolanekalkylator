import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useAmortizationScheduleView } from '../useAmortizationScheduleView'

describe('useAmortizationScheduleView', () => {
  it('returns milestone years and labels based on schedule thresholds', () => {
    const schedule = [
      {
        period: 1,
        paymentNumber: 12,
        monthlyPaymentSeK: 5000,
        annualPaymentSeK: 60000,
        principalSeK: 2000,
        annualPrincipalSeK: 24000,
        interestSeK: 3000,
        annualInterestSeK: 36000,
        remainingBalanceSeK: 650000,
      },
      {
        period: 2,
        paymentNumber: 24,
        monthlyPaymentSeK: 5000,
        annualPaymentSeK: 60000,
        principalSeK: 2500,
        annualPrincipalSeK: 30000,
        interestSeK: 2500,
        annualInterestSeK: 30000,
        remainingBalanceSeK: 480000,
      },
      {
        period: 3,
        paymentNumber: 36,
        monthlyPaymentSeK: 5000,
        annualPaymentSeK: 60000,
        principalSeK: 3000,
        annualPrincipalSeK: 36000,
        interestSeK: 2000,
        annualInterestSeK: 24000,
        remainingBalanceSeK: 360000,
      },
    ]

    const { result } = renderHook(() =>
      useAmortizationScheduleView({
        schedule,
        initialLoanAmount: 800000,
        housePrice: 1000000,
        annualIncome: 100000,
      })
    )

    expect(result.current.hasPrincipalReduction).toBe(true)
    expect(result.current.yearAt70).toBe(1)
    expect(result.current.yearAt50).toBe(2)
    expect(result.current.yearAtDebtRatio).toBe(3)
    expect(result.current.getMilestonesForYear(2)).toEqual(['50% nådd'])
    expect(result.current.getMilestonesForYear(3)).toEqual(['Skuldkvot 4,5x nådd'])
  })

  it('handles schedules without principal reduction or income', () => {
    const schedule = [
      {
        period: 1,
        paymentNumber: 12,
        monthlyPaymentSeK: 2000,
        annualPaymentSeK: 24000,
        principalSeK: 0,
        annualPrincipalSeK: 0,
        interestSeK: 2000,
        annualInterestSeK: 24000,
        remainingBalanceSeK: 800000,
      },
    ]

    const { result } = renderHook(() =>
      useAmortizationScheduleView({
        schedule,
        initialLoanAmount: 800000,
        housePrice: 1000000,
        annualIncome: 0,
      })
    )

    expect(result.current.hasPrincipalReduction).toBe(false)
    expect(result.current.yearAtDebtRatio).toBeNull()
    expect(result.current.getMilestonesForYear(1)).toEqual([])
    expect(result.current.currentRate).toBe(0.02)
  })
})
