import { useMemo } from 'react'
import type { MonthlyBudgetItem } from '../types/monthlyBudget'

interface UseMonthlyBudgetStateParams {
  items: MonthlyBudgetItem[]
  onItemsChange: (items: MonthlyBudgetItem[]) => void
}

export interface MonthlyBudgetStateViewModel {
  items: MonthlyBudgetItem[]
  totalMonthlyBudgetSeK: number
  addItem: () => void
  removeItem: (id: string) => void
  updateItemName: (id: string, name: string) => void
  updateItemAmount: (id: string, amountSeK: number) => void
}

function clampAmount(value: number): number {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.max(0, value)
}

export function useMonthlyBudgetState({
  items,
  onItemsChange,
}: UseMonthlyBudgetStateParams): MonthlyBudgetStateViewModel {
  const totalMonthlyBudgetSeK = useMemo(
    () => items.reduce((sum, item) => sum + clampAmount(item.amountSeK), 0),
    [items]
  )

  return {
    items,
    totalMonthlyBudgetSeK,
    addItem: () => {
      const newItem: MonthlyBudgetItem = {
        id: `budget-${Date.now()}`,
        name: '',
        amountSeK: 0,
      }
      onItemsChange([...items, newItem])
    },
    removeItem: (id) => {
      onItemsChange(items.filter((item) => item.id !== id))
    },
    updateItemName: (id, name) => {
      onItemsChange(
        items.map((item) =>
          item.id === id
            ? {
                ...item,
                name,
              }
            : item
        )
      )
    },
    updateItemAmount: (id, amountSeK) => {
      onItemsChange(
        items.map((item) =>
          item.id === id
            ? {
                ...item,
                amountSeK: clampAmount(amountSeK),
              }
            : item
        )
      )
    },
  }
}
