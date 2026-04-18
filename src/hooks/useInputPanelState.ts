import { useMemo, useState } from 'react'
import type { DownPaymentMode } from './useMortgageState'

interface UseInputPanelStateParams {
  housePrice: number
  downPayment: number
  monthlyIncome: number
  monthlyAmortization: number
  monthlyOperatingCost: number
  minimumMonthlyAmortization: number
  isMonthlyAmortizationAuto: boolean
  onHousePriceChange: (value: number) => void
  onDownPaymentChange: (value: number) => void
  onMonthlyIncomeChange: (value: number) => void
  onMonthlyAmortizationChange: (value: number) => void
  onMonthlyOperatingCostChange: (value: number) => void
  onMonthlyAmortizationModeChange: (isAuto: boolean) => void
  onDownPaymentModeChange: (mode: DownPaymentMode) => void
}

export interface InputPanelViewModel {
  downPaymentPercent: number
  isAmortizationBelowMinimum: boolean
  formatIntegerWithSpaces: (value: number) => string
  housePriceFieldValue: string
  monthlyIncomeFieldValue: string
  downPaymentFieldValue: string
  monthlyAmortizationFieldValue: string
  monthlyOperatingCostFieldValue: string
  onHousePriceInputChange: (value: string) => void
  onDownPaymentInputChange: (value: string) => void
  onMonthlyIncomeInputChange: (value: string) => void
  onMonthlyAmortizationInputChange: (value: string) => void
  onMonthlyOperatingCostInputChange: (value: string) => void
  onDownPaymentPercentChange: (valueString: string) => void
  onAmortizationModeSwitchChange: (checkedManual: boolean) => void
  onDownPaymentModeSwitchChange: (checkedPercentage: boolean) => void
}

function parseFormattedNumber(value: string): number {
  const normalized = value.replace(/\s/g, '').replace(',', '.')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

function formatIntegerWithSpaces(value: number): string {
  if (!Number.isFinite(value)) {
    return ''
  }

  return new Intl.NumberFormat('sv-SE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(value)))
}

export function useInputPanelState({
  housePrice,
  downPayment,
  monthlyIncome,
  monthlyAmortization,
  monthlyOperatingCost,
  minimumMonthlyAmortization,
  isMonthlyAmortizationAuto,
  onHousePriceChange,
  onDownPaymentChange,
  onMonthlyIncomeChange,
  onMonthlyAmortizationChange,
  onMonthlyOperatingCostChange,
  onMonthlyAmortizationModeChange,
  onDownPaymentModeChange,
}: UseInputPanelStateParams): InputPanelViewModel {
  const [amortizationTouched, setAmortizationTouched] = useState(false)

  const downPaymentPercent = useMemo(
    () => (housePrice > 0 ? (downPayment / housePrice) * 100 : 0),
    [housePrice, downPayment]
  )

  const isAmortizationBelowMinimum =
    amortizationTouched && monthlyAmortization < minimumMonthlyAmortization

  return {
    downPaymentPercent,
    isAmortizationBelowMinimum,
    formatIntegerWithSpaces,
    housePriceFieldValue: formatIntegerWithSpaces(housePrice),
    monthlyIncomeFieldValue: formatIntegerWithSpaces(monthlyIncome),
    downPaymentFieldValue: formatIntegerWithSpaces(downPayment),
    monthlyAmortizationFieldValue: formatIntegerWithSpaces(monthlyAmortization),
    monthlyOperatingCostFieldValue: formatIntegerWithSpaces(monthlyOperatingCost),
    onHousePriceInputChange: (value) => onHousePriceChange(parseFormattedNumber(value)),
    onDownPaymentInputChange: (value) => onDownPaymentChange(parseFormattedNumber(value)),
    onMonthlyIncomeInputChange: (value) => onMonthlyIncomeChange(parseFormattedNumber(value)),
    onMonthlyAmortizationInputChange: (value) => {
      setAmortizationTouched(true)
      if (isMonthlyAmortizationAuto) {
        onMonthlyAmortizationModeChange(false)
      }
      onMonthlyAmortizationChange(parseFormattedNumber(value))
    },
    onMonthlyOperatingCostInputChange: (value) =>
      onMonthlyOperatingCostChange(parseFormattedNumber(value)),
    onDownPaymentPercentChange: (valueString) => {
      const value = parseFloat(valueString)
      onDownPaymentChange((housePrice * (Number.isFinite(value) ? value : 0)) / 100)
    },
    onAmortizationModeSwitchChange: (checkedManual) => {
      if (!checkedManual) {
        setAmortizationTouched(false)
      }
      onMonthlyAmortizationModeChange(!checkedManual)
    },
    onDownPaymentModeSwitchChange: (checkedPercentage) => {
      onDownPaymentModeChange(checkedPercentage ? 'percentage' : 'amount')
    },
  }
}
