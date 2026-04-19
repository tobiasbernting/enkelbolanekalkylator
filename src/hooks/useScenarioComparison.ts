import { useCallback, useMemo, useState } from 'react'
import {
  BANK_RATE_PRESETS,
  getEffectiveRatesByType,
  getRatesByType,
  type BankRateType,
} from '../data/bankRates'
import type { LoanPortion } from '../utils/calculations'

interface UseScenarioComparisonParams {
  loanPortions: LoanPortion[]
  monthlyAmortizationSeK: number
  monthlyOperatingCostSeK: number
  monthlyBudgetCostSeK: number
  selectedBank: string
  selectedRateType: BankRateType
}

const THREE_MONTH_TERM_YEARS = 0.25
const TERM_TOLERANCE = 1e-6

interface HistoricalPolicyScenario {
  id: string
  label: string
  period: string
  worldEvent: string
  policyRate: number
}

export interface HistoricalPaymentScenario {
  id: string
  label: string
  period: string
  worldEvent: string
  policyRate: number
  deltaPercentPoints: number
  monthlyInterestSeK: number
  monthlyTotalSeK: number
  monthlyDeltaSeK: number
  monthlyEffectiveInterestSeK: number
  monthlyEffectiveTotalSeK: number
  monthlyEffectiveTotalWithBudgetSeK: number
  monthlyEffectiveDeltaSeK: number
  monthlyEffectiveDeltaWithBudgetSeK: number
}

const HISTORICAL_POLICY_SCENARIOS: HistoricalPolicyScenario[] = [
  {
    id: 'finanskris-2008',
    label: 'Finanskrisen 2008',
    period: '2008-09-10',
    worldEvent: 'Global finanskris efter Lehman-kollapsen',
    policyRate: 4.75,
  },
  {
    id: 'minusranta-2016',
    label: 'Minusränteperioden',
    period: '2016-02 till 2019-01',
    worldEvent: 'Deflationsoro och mycket låg inflation',
    policyRate: -0.5,
  },
  {
    id: 'covid-2020',
    label: 'Pandemin',
    period: '2020',
    worldEvent: 'Covid-19 och kraftigt ökad osäkerhet',
    policyRate: 0,
  },
  {
    id: 'inflationschock-2023',
    label: 'Inflationschocken',
    period: '2023-09 till 2024-04',
    worldEvent: 'Hög inflation, energikris och geopolitisk oro',
    policyRate: 4,
  },
  {
    id: 'normalisering-2026',
    label: 'Normalisering 2026',
    period: '2026-01 till 2026-03',
    worldEvent: 'Räntesänkningar efter fallande inflation',
    policyRate: 1.75,
  },
]

function isThreeMonthTerm(termYears: number): boolean {
  return Math.abs(termYears - THREE_MONTH_TERM_YEARS) < TERM_TOLERANCE
}

function clampShift(value: number): number {
  return Math.min(10, Math.max(-10, value))
}

function formatTerm(termYears: number): string {
  if (isThreeMonthTerm(termYears)) {
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
  hasThreeMonthPortion: boolean
  totalLoanAmountSeK: number
  weightedAverageRate: number
  weightedAverageEffectiveRate: number
  minRate: number
  maxRate: number
  minEffectiveRate: number
  maxEffectiveRate: number
  rateShiftPercentPoints: number
  baseMonthlyInterest: number
  adjustedMonthlyInterest: number
  baseMonthlyTotal: number
  adjustedMonthlyTotal: number
  baseMonthlyTotalWithBudget: number
  adjustedMonthlyTotalWithBudget: number
  baseMonthlyEffectiveInterest: number
  adjustedMonthlyEffectiveInterest: number
  baseMonthlyEffectiveTotal: number
  adjustedMonthlyEffectiveTotal: number
  baseMonthlyEffectiveTotalWithBudget: number
  adjustedMonthlyEffectiveTotalWithBudget: number
  deltaLabel: string
  bankRatesByTerm: Record<number, number>
  effectiveBankRatesByTerm: Record<number, number>
  currentThreeMonthRate: number | null
  currentThreeMonthEffectiveRate: number | null
  historicalScenarios: HistoricalPaymentScenario[]
  getBaseRateForPortion: (portion: LoanPortion) => number
  getAdjustedRateForPortion: (portion: LoanPortion) => number
  getBaseEffectiveRateForPortion: (portion: LoanPortion) => number
  getAdjustedEffectiveRateForPortion: (portion: LoanPortion) => number
  formatTerm: (termYears: number) => string
  formatPortionHeader: (index: number) => string
  onRateShiftChange: (value: number) => void
  onRateShiftInputChange: (valueString: string) => void
}

export function useScenarioComparison({
  loanPortions,
  monthlyAmortizationSeK,
  monthlyOperatingCostSeK,
  monthlyBudgetCostSeK,
  selectedBank,
  selectedRateType,
}: UseScenarioComparisonParams): ScenarioComparisonViewModel {
  const [rateShiftPercentPoints, setRateShiftPercentPoints] = useState(0)

  const hasPortions = loanPortions.length > 0

  const selectedPreset = BANK_RATE_PRESETS.find((preset) => preset.id === selectedBank)
  const bankRatesByTerm = useMemo(
    () =>
      selectedPreset
        ? getRatesByType(selectedPreset, selectedRateType)
        : ({} as Record<number, number>),
    [selectedPreset, selectedRateType]
  )
  const effectiveBankRatesByTerm = useMemo(
    () =>
      selectedPreset
        ? getEffectiveRatesByType(selectedPreset, selectedRateType)
        : ({} as Record<number, number>),
    [selectedPreset, selectedRateType]
  )
  const rateTypeLabel = selectedRateType === 'list' ? 'Listränta' : 'Snittränta'

  const getBaseRateForPortion = useCallback((portion: LoanPortion): number => {
    return bankRatesByTerm[portion.termYears] ?? portion.interestRate
  }, [bankRatesByTerm])

  const getAdjustedRateForPortion = useCallback((portion: LoanPortion): number => {
    const baseRate = getBaseRateForPortion(portion)
    if (!isThreeMonthTerm(portion.termYears)) {
      return baseRate
    }

    return Math.max(0, baseRate + rateShiftPercentPoints)
  }, [getBaseRateForPortion, rateShiftPercentPoints])

  const getBaseEffectiveRateForPortion = useCallback((portion: LoanPortion): number => {
    return (
      effectiveBankRatesByTerm[portion.termYears] ??
      bankRatesByTerm[portion.termYears] ??
      portion.interestRate
    )
  }, [effectiveBankRatesByTerm, bankRatesByTerm])

  const getAdjustedEffectiveRateForPortion = useCallback((portion: LoanPortion): number => {
    const baseEffectiveRate = getBaseEffectiveRateForPortion(portion)
    if (!isThreeMonthTerm(portion.termYears)) {
      return baseEffectiveRate
    }

    return Math.max(0, baseEffectiveRate + rateShiftPercentPoints)
  }, [getBaseEffectiveRateForPortion, rateShiftPercentPoints])

  const hasThreeMonthPortion = useMemo(
    () => loanPortions.some((portion) => isThreeMonthTerm(portion.termYears)),
    [loanPortions]
  )

  const currentThreeMonthRate = useMemo(() => {
    const threeMonthPortions = loanPortions.filter((portion) => isThreeMonthTerm(portion.termYears))
    if (threeMonthPortions.length === 0) {
      return null
    }

    const totalThreeMonthAmount = threeMonthPortions.reduce((sum, portion) => sum + portion.amountSeK, 0)
    if (totalThreeMonthAmount <= 0) {
      return null
    }

    const weightedThreeMonthRate = threeMonthPortions.reduce((sum, portion) => {
      const baseRate = getBaseRateForPortion(portion)
      return sum + baseRate * portion.amountSeK
    }, 0)

    return weightedThreeMonthRate / totalThreeMonthAmount
  }, [loanPortions, getBaseRateForPortion])

  const currentThreeMonthEffectiveRate = useMemo(() => {
    const threeMonthPortions = loanPortions.filter((portion) => isThreeMonthTerm(portion.termYears))
    if (threeMonthPortions.length === 0) {
      return null
    }

    const totalThreeMonthAmount = threeMonthPortions.reduce((sum, portion) => sum + portion.amountSeK, 0)
    if (totalThreeMonthAmount <= 0) {
      return null
    }

    const weightedThreeMonthRate = threeMonthPortions.reduce((sum, portion) => {
      const baseRate = getBaseEffectiveRateForPortion(portion)
      return sum + baseRate * portion.amountSeK
    }, 0)

    return weightedThreeMonthRate / totalThreeMonthAmount
  }, [loanPortions, getBaseEffectiveRateForPortion])

  const totalLoanAmountSeK = useMemo(
    () => loanPortions.reduce((sum, portion) => sum + portion.amountSeK, 0),
    [loanPortions]
  )

  const weightedAverageRate = useMemo(() => {
    if (totalLoanAmountSeK <= 0) {
      return 0
    }

    const weightedSum = loanPortions.reduce(
      (sum, portion) => sum + getBaseRateForPortion(portion) * portion.amountSeK,
      0
    )
    return weightedSum / totalLoanAmountSeK
  }, [loanPortions, totalLoanAmountSeK, getBaseRateForPortion])

  const minRate = useMemo(
    () =>
      loanPortions.length > 0
        ? Math.min(...loanPortions.map((portion) => getBaseRateForPortion(portion)))
        : 0,
    [loanPortions, getBaseRateForPortion]
  )

  const maxRate = useMemo(
    () =>
      loanPortions.length > 0
        ? Math.max(...loanPortions.map((portion) => getBaseRateForPortion(portion)))
        : 0,
    [loanPortions, getBaseRateForPortion]
  )

  const baseMonthlyInterest = useMemo(
    () =>
      loanPortions.reduce((sum, portion) => {
        const baseRate = getBaseRateForPortion(portion)
        return sum + (portion.amountSeK * baseRate) / 100 / 12
      }, 0),
    [loanPortions, getBaseRateForPortion]
  )

  const adjustedMonthlyInterest = useMemo(
    () =>
      loanPortions.reduce((sum, portion) => {
        const adjustedRate = getAdjustedRateForPortion(portion)
        return sum + (portion.amountSeK * adjustedRate) / 100 / 12
      }, 0),
    [loanPortions, getAdjustedRateForPortion]
  )

  const weightedAverageEffectiveRate = useMemo(() => {
    if (totalLoanAmountSeK <= 0) {
      return 0
    }

    const weightedSum = loanPortions.reduce(
      (sum, portion) => sum + getBaseEffectiveRateForPortion(portion) * portion.amountSeK,
      0
    )
    return weightedSum / totalLoanAmountSeK
  }, [loanPortions, totalLoanAmountSeK, getBaseEffectiveRateForPortion])

  const minEffectiveRate = useMemo(
    () =>
      loanPortions.length > 0
        ? Math.min(...loanPortions.map((portion) => getBaseEffectiveRateForPortion(portion)))
        : 0,
    [loanPortions, getBaseEffectiveRateForPortion]
  )

  const maxEffectiveRate = useMemo(
    () =>
      loanPortions.length > 0
        ? Math.max(...loanPortions.map((portion) => getBaseEffectiveRateForPortion(portion)))
        : 0,
    [loanPortions, getBaseEffectiveRateForPortion]
  )

  const baseMonthlyEffectiveInterest = useMemo(
    () =>
      loanPortions.reduce((sum, portion) => {
        const baseRate = getBaseEffectiveRateForPortion(portion)
        return sum + (portion.amountSeK * baseRate) / 100 / 12
      }, 0),
    [loanPortions, getBaseEffectiveRateForPortion]
  )

  const adjustedMonthlyEffectiveInterest = useMemo(
    () =>
      loanPortions.reduce((sum, portion) => {
        const adjustedRate = getAdjustedEffectiveRateForPortion(portion)
        return sum + (portion.amountSeK * adjustedRate) / 100 / 12
      }, 0),
    [loanPortions, getAdjustedEffectiveRateForPortion]
  )

  const baseMonthlyTotal = baseMonthlyInterest + monthlyAmortizationSeK
  const adjustedMonthlyTotal = adjustedMonthlyInterest + monthlyAmortizationSeK
  const baseMonthlyTotalWithBudget =
    baseMonthlyTotal + monthlyOperatingCostSeK + monthlyBudgetCostSeK
  const adjustedMonthlyTotalWithBudget =
    adjustedMonthlyTotal + monthlyOperatingCostSeK + monthlyBudgetCostSeK
  const baseMonthlyEffectiveTotal = baseMonthlyEffectiveInterest + monthlyAmortizationSeK
  const adjustedMonthlyEffectiveTotal = adjustedMonthlyEffectiveInterest + monthlyAmortizationSeK
  const baseMonthlyEffectiveTotalWithBudget =
    baseMonthlyEffectiveTotal + monthlyOperatingCostSeK + monthlyBudgetCostSeK
  const adjustedMonthlyEffectiveTotalWithBudget =
    adjustedMonthlyEffectiveTotal + monthlyOperatingCostSeK + monthlyBudgetCostSeK

  const historicalScenarios = useMemo(() => {
    if (!hasThreeMonthPortion || currentThreeMonthRate === null) {
      return []
    }

    return HISTORICAL_POLICY_SCENARIOS.map((scenario) => {
      const deltaPercentPoints = scenario.policyRate - currentThreeMonthRate

      const monthlyInterestSeK = loanPortions.reduce((sum, portion) => {
        const baseRate = getBaseRateForPortion(portion)
        const simulatedRate = isThreeMonthTerm(portion.termYears)
          ? Math.max(0, baseRate + deltaPercentPoints)
          : baseRate

        return sum + (portion.amountSeK * simulatedRate) / 100 / 12
      }, 0)

      const monthlyTotalSeK = monthlyInterestSeK + monthlyAmortizationSeK

      const monthlyEffectiveInterestSeK = loanPortions.reduce((sum, portion) => {
        const baseRate = getBaseEffectiveRateForPortion(portion)
        const simulatedRate = isThreeMonthTerm(portion.termYears)
          ? Math.max(0, baseRate + deltaPercentPoints)
          : baseRate

        return sum + (portion.amountSeK * simulatedRate) / 100 / 12
      }, 0)

      const monthlyEffectiveTotalSeK = monthlyEffectiveInterestSeK + monthlyAmortizationSeK
      const monthlyEffectiveTotalWithBudgetSeK =
        monthlyEffectiveTotalSeK + monthlyOperatingCostSeK + monthlyBudgetCostSeK

      return {
        id: scenario.id,
        label: scenario.label,
        period: scenario.period,
        worldEvent: scenario.worldEvent,
        policyRate: scenario.policyRate,
        deltaPercentPoints,
        monthlyInterestSeK,
        monthlyTotalSeK,
        monthlyDeltaSeK: monthlyTotalSeK - baseMonthlyTotal,
        monthlyEffectiveInterestSeK,
        monthlyEffectiveTotalSeK,
        monthlyEffectiveTotalWithBudgetSeK,
        monthlyEffectiveDeltaSeK: monthlyEffectiveTotalSeK - baseMonthlyEffectiveTotal,
        monthlyEffectiveDeltaWithBudgetSeK:
          monthlyEffectiveTotalWithBudgetSeK - baseMonthlyEffectiveTotalWithBudget,
      }
    })
  }, [
    hasThreeMonthPortion,
    currentThreeMonthRate,
    loanPortions,
    getBaseRateForPortion,
    getBaseEffectiveRateForPortion,
    monthlyAmortizationSeK,
    monthlyOperatingCostSeK,
    monthlyBudgetCostSeK,
    baseMonthlyTotal,
    baseMonthlyEffectiveTotal,
    baseMonthlyEffectiveTotalWithBudget,
  ])

  const deltaLabel = `${rateShiftPercentPoints > 0 ? '+' : ''}${rateShiftPercentPoints.toFixed(2)} %-enheter`

  const sortedPortions = useMemo(
    () => [...loanPortions].sort((a, b) => a.termYears - b.termYears),
    [loanPortions]
  )

  return {
    hasPortions,
    selectedPresetLabel: selectedPreset?.label ?? 'Egen ränta',
    rateTypeLabel,
    sortedPortions,
    hasThreeMonthPortion,
    totalLoanAmountSeK,
    weightedAverageRate,
    weightedAverageEffectiveRate,
    minRate,
    maxRate,
    minEffectiveRate,
    maxEffectiveRate,
    rateShiftPercentPoints,
    baseMonthlyInterest,
    adjustedMonthlyInterest,
    baseMonthlyTotal,
    adjustedMonthlyTotal,
    baseMonthlyTotalWithBudget,
    adjustedMonthlyTotalWithBudget,
    baseMonthlyEffectiveInterest,
    adjustedMonthlyEffectiveInterest,
    baseMonthlyEffectiveTotal,
    adjustedMonthlyEffectiveTotal,
    baseMonthlyEffectiveTotalWithBudget,
    adjustedMonthlyEffectiveTotalWithBudget,
    deltaLabel,
    bankRatesByTerm,
    effectiveBankRatesByTerm,
    currentThreeMonthRate,
    currentThreeMonthEffectiveRate,
    historicalScenarios,
    getBaseRateForPortion,
    getAdjustedRateForPortion,
    getBaseEffectiveRateForPortion,
    getAdjustedEffectiveRateForPortion,
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
