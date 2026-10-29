import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { formatMonthsToDebtFree, useWhatIfView } from '../useWhatIfView'

const loanPortions = [{ id: 'p1', bankId: '', amountSeK: 2000000, termYears: 0.25, interestRate: 3 }]

describe('useWhatIfView', () => {
  it('starts unchanged and reacts to rate and amortization changes', () => {
    const { result } = renderHook(() =>
      useWhatIfView({
        loanPortions,
        currentMonthlyAmortizationSeK: 3333.4,
        requiredMonthlyAmortizationSeK: 3333.4,
        numberOfBorrowers: 1,
        loanMode: 'existing',
      })
    )

    expect(result.current.isUnchanged).toBe(true)
    expect(result.current.newMonthlyAmortizationSeK).toBe(3333)

    act(() => {
      result.current.onRateChange(9)
    })
    expect(result.current.rateChangePercentPoints).toBe(5)
    expect(result.current.isScenarioCheaper).toBe(false)

    act(() => {
      result.current.reset()
      result.current.onNewMonthlyAmortizationInputChange('1 000')
    })
    expect(result.current.newMonthlyAmortizationSeK).toBe(1000)
    expect(result.current.isNewAmortizationBelowRequirement).toBe(true)
    expect(result.current.isScenarioCheaper).toBe(true)
    expect(result.current.amortizationPresets.some((preset) => preset.label === 'Ingen amortering')).toBe(true)
  })

  it('formats months to debt free', () => {
    expect(formatMonthsToDebtFree(null)).toBe('Amorteras inte av')
    expect(formatMonthsToDebtFree(5)).toBe('5 mån')
    expect(formatMonthsToDebtFree(24)).toBe('2 år')
    expect(formatMonthsToDebtFree(30)).toBe('2 år 6 mån')
  })
})
