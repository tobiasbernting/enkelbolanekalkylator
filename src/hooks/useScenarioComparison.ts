import { useMemo, useState } from 'react'
import { BANK_RATE_PRESETS, getRatesByType, type BankRateType } from '../data/bankRates'
import type { LoanPortion } from '../utils/calculations'

interface UseScenarioComparisonParams {
  loanPortions: LoanPortion[]
  monthlyAmortizationSeK: number
  selectedBank: string
  selectedRateType: BankRateType
}

function clampShift(value: number): number {
  return Math.min(10, Math.max(-10, value))
}

function monthlyInterestForShift(loanPortions: LoanPortion[], shiftPercentPoints: number): number {
  return loanPortions.reduce((sum, portion) => {
    const shiftedRate = Math.max(0, portion.interestRate + shiftPercentPoints)
    return sum + (portion.amountSeK * shiftedRate) / 100 / 12
  }, 0)
}

function formatTerm(termYears: number): string {
  if (termYears === 0.25) {
    return '3 mån'
  }

  return `${termYears} år`
}

function formatPortionHeader(index: number): string {
  return `Lån ${index + 1}`
}

export interface ScenarioComparisonViewModel {
  hasPortions: boolean
  selectedPresetLabel: string
  rateTypeLabel: string
  sortedPortions: LoanPortion[]
  totalLoanAmountSeK: number
  weightedAverageRate: number
  minRate: number
  maxRate: number
  rateShiftPercentPoints: number
  baseMonthlyInterest: number
  adjustedMonthlyInterest: number
  baseMonthlyTotal: number
  adjustedMonthlyTotal: number
  deltaLabel: string
  bankRatesByTerm: Record<number, number>
  formatTerm: (termYears: number) => string
  formatPortionHeader: (index: number) => string
  onRateShiftChange: (value: number) => void
  onRateShiftInputChange: (valueString: string) => void
}

export function useScenarioComparison({
  loanPortions,
  monthlyAmortizationSeK,
  selectedBank,
  selectedRateType,
}: UseScenarioComparisonParams): ScenarioComparisonViewModel {
  const [rateShiftPercentPoints, setRateShiftPercentPoints] = useState(0)

  const hasPortions = loanPortions.length > 0

  const selectedPreset =
    BANK_RATE_PRESETS.find((preset) => preset.id === selectedBank) ?? BANK_RATE_PRESETS[0]
  const bankRatesByTerm = getRatesByType(selectedPreset, selectedRateType)
  const rateTypeLabel = selectedRateType === 'list' ? 'Listränta' : 'Snittränta'

  const totalLoanAmountSeK = useMemo(
    () => loanPortions.reduce((sum, portion) => sum + portion.amountSeK, 0),
    [loanPortions]
  )

  const weightedAverageRate = useMemo(() => {
    if (totalLoanAmountSeK <= 0) {
      return 0
    }

    const weightedSum = loanPortions.reduce(
      (sum, portion) => sum + portion.interestRate * portion.amountSeK,
      0
    )
    return weightedSum / totalLoanAmountSeK
  }, [loanPortions, totalLoanAmountSeK])

  const minRate = useMemo(
    () => (loanPortions.length > 0 ? Math.min(...loanPortions.map((portion) => portion.interestRate)) : 0),
    [loanPortions]
  )

  const maxRate = useMemo(
    () => (loanPortions.length > 0 ? Math.max(...loanPortions.map((portion) => portion.interestRate)) : 0),
    [loanPortions]
  )

  const baseMonthlyInterest = useMemo(() => monthlyInterestForShift(loanPortions, 0), [loanPortions])
  const adjustedMonthlyInterest = useMemo(
    () => monthlyInterestForShift(loanPortions, rateShiftPercentPoints),
    [loanPortions, rateShiftPercentPoints]
  )

  const baseMonthlyTotal = baseMonthlyInterest + monthlyAmortizationSeK
  const adjustedMonthlyTotal = adjustedMonthlyInterest + monthlyAmortizationSeK

  const deltaLabel = `${rateShiftPercentPoints > 0 ? '+' : ''}${rateShiftPercentPoints.toFixed(2)} %-enheter`

  const sortedPortions = useMemo(
    () => [...loanPortions].sort((a, b) => a.termYears - b.termYears),
    [loanPortions]
  )

  return {
    hasPortions,
    selectedPresetLabel: selectedPreset.label,
    rateTypeLabel,
    sortedPortions,
    totalLoanAmountSeK,
    weightedAverageRate,
    minRate,
    maxRate,
    rateShiftPercentPoints,
    baseMonthlyInterest,
    adjustedMonthlyInterest,
    baseMonthlyTotal,
    adjustedMonthlyTotal,
    deltaLabel,
    bankRatesByTerm,
    formatTerm,
    formatPortionHeader,
    onRateShiftChange: (value) => {
      setRateShiftPercentPoints(value)
    },
    onRateShiftInputChange: (valueString) => {
      const nextValue = Number(valueString)
      if (Number.isFinite(nextValue)) {
        setRateShiftPercentPoints(clampShift(nextValue))
      }
    },
  }
}
