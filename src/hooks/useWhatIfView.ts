import { useMemo, useState } from 'react'
import { calculateWhatIf, type LoanPortion, type WhatIfResult } from '../utils/calculations'
import type { LoanMode } from './useMortgageState'

interface UseWhatIfViewParams {
  loanPortions: LoanPortion[]
  currentMonthlyAmortizationSeK: number
  requiredMonthlyAmortizationSeK: number
  numberOfBorrowers: 1 | 2
  loanMode: LoanMode
}

export const RATE_CHANGE_MIN = -3
export const RATE_CHANGE_MAX = 5
export const RATE_CHANGE_PRESETS = [-1, -0.5, 0.5, 1, 2]
const AMORTIZATION_STEP_SEK = 1000

export interface WhatIfViewModel {
  hasLoan: boolean
  rateChangePercentPoints: number
  rateChangeLabel: string
  newMonthlyAmortizationSeK: number
  newMonthlyAmortizationFieldValue: string
  isNewAmortizationBelowRequirement: boolean
  result: WhatIfResult
  summaryText: string
  isScenarioCheaper: boolean
  isUnchanged: boolean
  amortizationPresets: { label: string; valueSeK: number }[]
  onRateChange: (value: number) => void
  onNewMonthlyAmortizationChange: (value: number) => void
  onNewMonthlyAmortizationInputChange: (value: string) => void
  reset: () => void
}

function clampRateChange(value: number): number {
  return Math.min(RATE_CHANGE_MAX, Math.max(RATE_CHANGE_MIN, value))
}

function formatInteger(value: number): string {
  return new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 0 }).format(Math.round(value))
}

export function formatRateChange(value: number): string {
  const sign = value > 0 ? '+' : value < 0 ? '−' : '±'
  return `${sign}${Math.abs(value).toLocaleString('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %-enheter`
}

export function formatMonthsToDebtFree(months: number | null): string {
  if (months === null) {
    return 'Amorteras inte av'
  }

  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  if (years === 0) {
    return `${remainingMonths} mån`
  }

  return remainingMonths === 0 ? `${years} år` : `${years} år ${remainingMonths} mån`
}

export function useWhatIfView({
  loanPortions,
  currentMonthlyAmortizationSeK,
  requiredMonthlyAmortizationSeK,
  numberOfBorrowers,
  loanMode,
}: UseWhatIfViewParams): WhatIfViewModel {
  const [rateChangePercentPoints, setRateChangePercentPoints] = useState(0)
  // null = follow today's amortization until the user picks something else.
  const [customAmortizationSeK, setCustomAmortizationSeK] = useState<number | null>(null)

  const roundedCurrentAmortizationSeK = Math.round(currentMonthlyAmortizationSeK)
  const newMonthlyAmortizationSeK = customAmortizationSeK ?? roundedCurrentAmortizationSeK

  const result = useMemo(
    () =>
      calculateWhatIf({
        portions: loanPortions,
        rateChangePercentPoints,
        currentMonthlyAmortizationSeK: roundedCurrentAmortizationSeK,
        newMonthlyAmortizationSeK,
        numberOfBorrowers,
      }),
    [loanPortions, rateChangePercentPoints, roundedCurrentAmortizationSeK, newMonthlyAmortizationSeK, numberOfBorrowers]
  )

  const isUnchanged = Math.abs(result.monthlyNetPaymentDeltaSeK) < 0.5
  const isScenarioCheaper = result.monthlyNetPaymentDeltaSeK < 0

  const summaryText = isUnchanged
    ? 'Ändra räntan eller amorteringen för att se hur din månadskostnad påverkas.'
    : `Du betalar ${formatInteger(Math.abs(result.monthlyPaymentDeltaSeK))} kr ${
        result.monthlyPaymentDeltaSeK > 0 ? 'mer' : 'mindre'
      } per månad. Efter ränteavdrag blir det ${formatInteger(Math.abs(result.yearlyNetPaymentDeltaSeK))} kr ${
        result.yearlyNetPaymentDeltaSeK > 0 ? 'mer' : 'mindre'
      } per år.`

  const requiredRoundedSeK = Math.round(requiredMonthlyAmortizationSeK)
  const amortizationPresets = [
    { label: 'Som idag', valueSeK: roundedCurrentAmortizationSeK },
    { label: 'Amorteringskravet', valueSeK: requiredRoundedSeK },
    {
      label: `−${formatInteger(AMORTIZATION_STEP_SEK)} kr`,
      valueSeK: Math.max(0, newMonthlyAmortizationSeK - AMORTIZATION_STEP_SEK),
    },
    {
      label: `+${formatInteger(AMORTIZATION_STEP_SEK)} kr`,
      valueSeK: newMonthlyAmortizationSeK + AMORTIZATION_STEP_SEK,
    },
  ]

  if (loanMode === 'existing') {
    amortizationPresets.splice(2, 0, { label: 'Ingen amortering', valueSeK: 0 })
  }

  const setAmortization = (value: number) => {
    setCustomAmortizationSeK(Math.max(0, Math.round(Number.isFinite(value) ? value : 0)))
  }

  return {
    hasLoan: result.current.loanAmountSeK > 0,
    rateChangePercentPoints,
    rateChangeLabel: formatRateChange(rateChangePercentPoints),
    newMonthlyAmortizationSeK,
    newMonthlyAmortizationFieldValue: formatInteger(newMonthlyAmortizationSeK),
    isNewAmortizationBelowRequirement: newMonthlyAmortizationSeK < requiredRoundedSeK,
    result,
    summaryText,
    isScenarioCheaper,
    isUnchanged,
    amortizationPresets,
    onRateChange: (value) => {
      if (Number.isFinite(value)) {
        setRateChangePercentPoints(clampRateChange(Math.round(value * 100) / 100))
      }
    },
    onNewMonthlyAmortizationChange: setAmortization,
    onNewMonthlyAmortizationInputChange: (value) => {
      setAmortization(Number(value.replace(/\s/g, '')))
    },
    reset: () => {
      setRateChangePercentPoints(0)
      setCustomAmortizationSeK(null)
    },
  }
}
