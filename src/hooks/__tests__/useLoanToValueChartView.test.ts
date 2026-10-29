import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useLoanToValueChartView } from '../useLoanToValueChartView'
import { projectMortgage } from '../../utils/calculations'

const startDate = new Date(2026, 10, 1)
const projection = projectMortgage({
  portions: [{ id: 'p1', bankId: '', amountSeK: 800000, termYears: 0.25, interestRate: 6 }],
  housePriceSeK: 1000000,
  amortizationMode: 'fixed',
  fixedMonthlyAmortizationSeK: 2000,
  enforceRequirement: false,
})

describe('useLoanToValueChartView', () => {
  it('describes the chart for screen readers', () => {
    const { result } = renderHook(() => useLoanToValueChartView({ projection, startDate, width: 800 }))

    expect(result.current.summary).toBe(
      'Belåningsgrad över tid, från 80,0 % idag. Under 70 % i december 2030. Under 50 % i april 2039.'
    )
    expect(result.current.milestones.map((m) => m.key)).toEqual(['below70', 'below50'])
  })

  it('moves the readout a year at a time with the arrow keys', () => {
    const { result } = renderHook(() => useLoanToValueChartView({ projection, startDate, width: 800 }))

    expect(result.current.active).toBeNull()
    act(() => {
      result.current.onKeyDown('ArrowRight')
    })
    expect(result.current.active?.month).toBe(12)
    // 800 000 − 12 × 2 000 = 776 000 → 77,6 %
    expect(result.current.active?.loanToValueLabel).toBe('77,6 %')

    act(() => {
      result.current.onKeyDown('End')
    })
    expect(result.current.active?.balanceSeK).toBeCloseTo(0, 6)
    expect(result.current.onKeyDown('a')).toBe(false)
  })

  it('hides a milestone label that has no free space next to the dot', () => {
    const { result } = renderHook(() => useLoanToValueChartView({ projection, startDate, width: 240 }))

    expect(result.current.milestones.some((m) => !m.showLabel)).toBe(true)
  })
})
