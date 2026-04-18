import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useSummaryCardView } from '../useSummaryCardView'

describe('useSummaryCardView', () => {
  it('returns false when portion details are missing or single', () => {
    const { result: missingResult } = renderHook(() =>
      useSummaryCardView({ portionDetails: undefined })
    )
    const { result: singleResult } = renderHook(() =>
      useSummaryCardView({
        portionDetails: [
          {
            id: 'a',
            bankId: 'sbab',
            amountSeK: 1000000,
            termYears: 3,
            interestRate: 3.2,
            monthlyPaymentSeK: 2666.67,
            totalInterestSeK: 96000,
          },
        ],
      })
    )

    expect(missingResult.current.hasMultiplePortions).toBe(false)
    expect(singleResult.current.hasMultiplePortions).toBe(false)
  })

  it('returns true when there are multiple portion details', () => {
    const { result } = renderHook(() =>
      useSummaryCardView({
        portionDetails: [
          {
            id: 'a',
            bankId: 'sbab',
            amountSeK: 1000000,
            termYears: 3,
            interestRate: 3.2,
            monthlyPaymentSeK: 2666.67,
            totalInterestSeK: 96000,
          },
          {
            id: 'b',
            bankId: 'sbab',
            amountSeK: 500000,
            termYears: 5,
            interestRate: 3.5,
            monthlyPaymentSeK: 1458.33,
            totalInterestSeK: 87500,
          },
        ],
      })
    )

    expect(result.current.hasMultiplePortions).toBe(true)
  })
})
