import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useMonthlyBudgetState } from '../useMonthlyBudgetState'
import type { MonthlyBudgetItem } from '../../types/monthlyBudget'

describe('useMonthlyBudgetState', () => {
  it('adds, updates and removes budget rows', () => {
    const onItemsChange = vi.fn()
    const initialItems: MonthlyBudgetItem[] = []

    const { result } = renderHook(() =>
      useMonthlyBudgetState({
        items: initialItems,
        onItemsChange,
      })
    )

    act(() => {
      result.current.addItem()
    })

    expect(onItemsChange).toHaveBeenCalledTimes(1)
    const addedItems = onItemsChange.mock.calls[0][0] as MonthlyBudgetItem[]
    expect(addedItems).toHaveLength(1)
    expect(addedItems[0]).toMatchObject({ name: '', amountSeK: 0 })

    const onItemsChangeUpdate = vi.fn()
    const { result: updateResult } = renderHook(() =>
      useMonthlyBudgetState({
        items: addedItems,
        onItemsChange: onItemsChangeUpdate,
      })
    )

    act(() => {
      updateResult.current.updateItemName(addedItems[0].id, 'El')
      updateResult.current.updateItemAmount(addedItems[0].id, -120)
    })

    const updatedNameItems = onItemsChangeUpdate.mock.calls[0][0] as MonthlyBudgetItem[]
    expect(updatedNameItems[0].name).toBe('El')

    const updatedAmountItems = onItemsChangeUpdate.mock.calls[1][0] as MonthlyBudgetItem[]
    expect(updatedAmountItems[0].amountSeK).toBe(0)

    const onItemsChangeRemove = vi.fn()
    const { result: removeResult } = renderHook(() =>
      useMonthlyBudgetState({
        items: updatedAmountItems,
        onItemsChange: onItemsChangeRemove,
      })
    )

    act(() => {
      removeResult.current.removeItem(updatedAmountItems[0].id)
    })

    expect(onItemsChangeRemove.mock.calls[0][0]).toHaveLength(0)
  })

  it('calculates monthly budget total from all items', () => {
    const items: MonthlyBudgetItem[] = [
      { id: '1', name: 'El', amountSeK: 1000 },
      { id: '2', name: 'Internet', amountSeK: 500 },
      { id: '3', name: 'Forsakring', amountSeK: 900 },
    ]

    const { result } = renderHook(() =>
      useMonthlyBudgetState({
        items,
        onItemsChange: vi.fn(),
      })
    )

    expect(result.current.totalMonthlyBudgetSeK).toBe(2400)
  })
})
