import { useMemo } from 'react'
import type { BankComparisonRow } from '../types/bankComparison'

interface UseBankComparisonViewParams {
  rows: BankComparisonRow[]
}

export interface BankComparisonViewModel {
  hasRows: boolean
  portionHeaders: BankComparisonRow['portionRates']
  formatTerm: (termYears: number) => string
}

function formatTerm(termYears: number): string {
  if (termYears === 0.25) {
    return '3 mån'
  }

  return `${termYears} år`
}

export function useBankComparisonView({ rows }: UseBankComparisonViewParams): BankComparisonViewModel {
  const portionHeaders = useMemo(() => rows[0]?.portionRates ?? [], [rows])

  return {
    hasRows: rows.length > 0,
    portionHeaders,
    formatTerm,
  }
}
