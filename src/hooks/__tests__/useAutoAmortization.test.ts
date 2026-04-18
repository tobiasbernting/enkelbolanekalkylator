import { act, renderHook, waitFor } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { useAutoAmortization } from '../useAutoAmortization'

describe('useAutoAmortization', () => {
  it('auto-syncs amortization to required value when mode is auto', async () => {
    const { result } = renderHook(() => {
      const [monthlyAmortization, setMonthlyAmortization] = useState(0)
      const [isMonthlyAmortizationUserSet, setIsMonthlyAmortizationUserSet] = useState(false)

      const hook = useAutoAmortization({
        monthlyAmortization,
        isMonthlyAmortizationUserSet,
        requiredMonthlyAmortization: 1234.6,
        setMonthlyAmortization,
        setIsMonthlyAmortizationUserSet,
      })

      return {
        ...hook,
        monthlyAmortization,
        isMonthlyAmortizationUserSet,
      }
    })

    await waitFor(() => {
      expect(result.current.monthlyAmortization).toBe(1235)
    })

    expect(result.current.isMonthlyAmortizationAuto).toBe(true)
  })

  it('switches between manual and auto mode correctly', async () => {
    const { result } = renderHook(() => {
      const [monthlyAmortization, setMonthlyAmortization] = useState(1000)
      const [isMonthlyAmortizationUserSet, setIsMonthlyAmortizationUserSet] = useState(false)

      const hook = useAutoAmortization({
        monthlyAmortization,
        isMonthlyAmortizationUserSet,
        requiredMonthlyAmortization: 2500.2,
        setMonthlyAmortization,
        setIsMonthlyAmortizationUserSet,
      })

      return {
        ...hook,
        monthlyAmortization,
        isMonthlyAmortizationUserSet,
      }
    })

    act(() => {
      result.current.setAmortizationMode(false)
    })

    expect(result.current.isMonthlyAmortizationUserSet).toBe(true)
    expect(result.current.isMonthlyAmortizationAuto).toBe(false)

    act(() => {
      result.current.setManualMonthlyAmortization(3000)
    })

    expect(result.current.monthlyAmortization).toBe(3000)

    act(() => {
      result.current.setAmortizationMode(true)
    })

    await waitFor(() => {
      expect(result.current.monthlyAmortization).toBe(2500)
      expect(result.current.isMonthlyAmortizationAuto).toBe(true)
    })
  })
})
