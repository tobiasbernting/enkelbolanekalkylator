import { useState } from 'react'
import type { LoanMode } from './useMortgageState'
import { formatPercentagePointChange } from '../utils/planFormatting'

interface UsePlanControlsViewParams {
  loanMode: LoanMode
  isAmortizationAuto: boolean
  effectiveMonthlyAmortizationSeK: number
  requiredMonthlyAmortizationSeK: number
  loanAmountSeK: number
  rateChange: number
  currentPaymentSeK: number
  baselinePaymentSeK: number
  onAmortizationChange: (value: number) => void
  onFollowRequirement: () => void
  onRateChange: (value: number) => void
}

export const RATE_CHANGE_MIN = -3
export const RATE_CHANGE_MAX = 5
export const RATE_CHANGE_STEP = 0.25
export const RATE_CHANGE_PRESETS = [-1, -0.5, 0.5, 1, 2]
const AMORTIZATION_STEP_SEK = 100

export interface PlanControlsViewModel {
  isExistingLoan: boolean
  isAmortizationAuto: boolean
  amortizationSliderValue: number
  amortizationSliderMin: number
  amortizationSliderMax: number
  amortizationStep: number
  amortizationFieldValue: string
  amortizationYearlyPercentLabel: string
  requiredMonthlyAmortizationSeK: number
  isBelowRequirement: boolean
  rateChange: number
  rateChangeLabel: string
  paymentDeltaSeK: number
  isChangedFromBaseline: boolean
  onAmortizationSliderChange: (value: number) => void
  onAmortizationInputChange: (value: string) => void
  onAmortizationInputBlur: () => void
  onFollowRequirement: () => void
  onNoAmortization: () => void
  onRateChange: (value: number) => void
  onReset: () => void
}

function formatInteger(value: number): string {
  return new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 0 }).format(Math.round(value))
}

function roundUpTo(value: number, step: number): number {
  return Math.ceil(value / step) * step
}

export function usePlanControlsView({
  loanMode,
  isAmortizationAuto,
  effectiveMonthlyAmortizationSeK,
  requiredMonthlyAmortizationSeK,
  loanAmountSeK,
  rateChange,
  currentPaymentSeK,
  baselinePaymentSeK,
  onAmortizationChange,
  onFollowRequirement,
  onRateChange,
}: UsePlanControlsViewParams): PlanControlsViewModel {
  // While typing, show what the user typed; a new loan's amount is raised to the
  // requirement, which would otherwise overwrite the field mid-typing.
  const [draft, setDraft] = useState<string | null>(null)

  const isExistingLoan = loanMode === 'existing'
  const shownAmortizationSeK = Math.round(effectiveMonthlyAmortizationSeK)
  const sliderMin = isExistingLoan ? 0 : Math.round(requiredMonthlyAmortizationSeK / AMORTIZATION_STEP_SEK) * AMORTIZATION_STEP_SEK
  const sliderMax = roundUpTo(
    Math.max(5000, (loanAmountSeK * 0.05) / 12, requiredMonthlyAmortizationSeK * 3, shownAmortizationSeK * 1.5),
    1000
  )
  const paymentDeltaSeK = currentPaymentSeK - baselinePaymentSeK

  const setAmortization = (value: number) => {
    onAmortizationChange(Math.max(0, Math.round(Number.isFinite(value) ? value : 0)))
  }

  return {
    isExistingLoan,
    isAmortizationAuto,
    amortizationSliderValue: Math.min(sliderMax, Math.max(sliderMin, shownAmortizationSeK)),
    amortizationSliderMin: sliderMin,
    amortizationSliderMax: sliderMax,
    amortizationStep: AMORTIZATION_STEP_SEK,
    amortizationFieldValue: draft ?? formatInteger(shownAmortizationSeK),
    amortizationYearlyPercentLabel:
      loanAmountSeK > 0
        ? `${((shownAmortizationSeK * 12 * 100) / loanAmountSeK).toLocaleString('sv-SE', {
            maximumFractionDigits: 1,
          })} % av lånet per år`
        : '',
    requiredMonthlyAmortizationSeK,
    isBelowRequirement: shownAmortizationSeK < Math.round(requiredMonthlyAmortizationSeK),
    rateChange,
    rateChangeLabel: formatPercentagePointChange(rateChange),
    paymentDeltaSeK,
    isChangedFromBaseline: Math.abs(paymentDeltaSeK) >= 1 || rateChange !== 0 || !isAmortizationAuto,
    onAmortizationSliderChange: (value) => {
      setDraft(null)
      setAmortization(value)
    },
    onAmortizationInputChange: (value) => {
      setDraft(value)
      setAmortization(Number(value.replace(/\s/g, '')))
    },
    onAmortizationInputBlur: () => setDraft(null),
    onFollowRequirement: () => {
      setDraft(null)
      onFollowRequirement()
    },
    onNoAmortization: () => {
      setDraft(null)
      setAmortization(0)
    },
    onRateChange: (value) => {
      if (Number.isFinite(value)) {
        onRateChange(Math.min(RATE_CHANGE_MAX, Math.max(RATE_CHANGE_MIN, Math.round(value * 100) / 100)))
      }
    },
    onReset: () => {
      setDraft(null)
      onFollowRequirement()
      onRateChange(0)
    },
  }
}

