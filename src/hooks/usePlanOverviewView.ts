import { useMemo } from 'react'
import type { LoanToValueMilestone, MortgageProjection } from '../utils/calculations'
import {
  formatDuration,
  formatLoanToValue,
  formatMonthYear,
  getDateForPaymentMonth,
} from '../utils/planFormatting'

interface UsePlanOverviewViewParams {
  projection: MortgageProjection
  baselineProjection: MortgageProjection
  startDate: Date
  monthlyInterestDeductionSeK: number
  monthlyOperatingCostSeK: number
  monthlyBudgetCostSeK: number
}

export interface MilestoneTile {
  key: LoanToValueMilestone
  label: string
  value: string
  detail: string
  /** e.g. "1 år 2 mån tidigare än med amorteringskravet"; null when unchanged or not comparable. */
  comparison: string | null
  isReached: boolean
}

export interface PlanOverviewViewModel {
  hasPlan: boolean
  monthlyPaymentSeK: number
  monthlyInterestSeK: number
  monthlyAmortizationSeK: number
  monthlyNetPaymentSeK: number
  totalHousingCostSeK: number
  hasHousingExtras: boolean
  currentLoanToValueLabel: string
  milestones: MilestoneTile[]
  /** When the monthly payment next changes because amorteringskravet steps down. */
  nextChange: { dateLabel: string; amortizationSeK: number; paymentSeK: number; isLower: boolean } | null
}

const MILESTONE_LABELS: Record<LoanToValueMilestone, string> = {
  below70: 'Under 70 % belåningsgrad',
  below50: 'Under 50 % belåningsgrad',
  debtFree: 'Skuldfri',
}

function describeComparison(month: number | null, baselineMonth: number | null): string | null {
  if (month === null || month === 0) {
    return null
  }

  if (baselineMonth === null) {
    return 'Nås inte med bara amorteringskravet'
  }

  const difference = baselineMonth - month
  if (difference === 0) {
    return null
  }

  return `${formatDuration(Math.abs(difference))} ${difference > 0 ? 'tidigare' : 'senare'} än med amorteringskravet`
}

export function usePlanOverviewView({
  projection,
  baselineProjection,
  startDate,
  monthlyInterestDeductionSeK,
  monthlyOperatingCostSeK,
  monthlyBudgetCostSeK,
}: UsePlanOverviewViewParams): PlanOverviewViewModel {
  const firstMonth = projection.months[0]
  const monthlyInterestSeK = firstMonth?.interestSeK ?? 0
  const monthlyAmortizationSeK = firstMonth?.amortizationSeK ?? 0
  const monthlyPaymentSeK = monthlyInterestSeK + monthlyAmortizationSeK

  const milestones = useMemo<MilestoneTile[]>(
    () =>
      (['below70', 'below50', 'debtFree'] as LoanToValueMilestone[]).map((key) => {
        const month = projection.milestoneMonths[key]
        const label = MILESTONE_LABELS[key]

        if (month === 0) {
          return { key, label, value: 'Redan nått', detail: 'Du är redan här', comparison: null, isReached: true }
        }

        if (month === null) {
          return {
            key,
            label,
            value: 'Nås inte',
            detail:
              key === 'debtFree' && projection.months.length > 0
                ? 'Amorteringskravet upphör under 50 %'
                : 'Med nuvarande amortering',
            comparison: null,
            isReached: false,
          }
        }

        return {
          key,
          label,
          value: formatMonthYear(getDateForPaymentMonth(startDate, month)),
          detail: `om ${formatDuration(month)}`,
          comparison: describeComparison(month, baselineProjection.milestoneMonths[key]),
          isReached: false,
        }
      }),
    [projection, baselineProjection, startDate]
  )

  const nextChange = useMemo(() => {
    if (!firstMonth) {
      return null
    }

    // Only changes caused by amorteringskravet stepping down, not the smaller final payment.
    const changed = projection.months.find(
      (month) =>
        month.requiredRate !== firstMonth.requiredRate &&
        Math.abs(month.amortizationSeK - firstMonth.amortizationSeK) > 1
    )
    if (!changed) {
      return null
    }

    return {
      dateLabel: formatMonthYear(getDateForPaymentMonth(startDate, changed.month)),
      amortizationSeK: changed.amortizationSeK,
      paymentSeK: changed.paymentSeK,
      isLower: changed.amortizationSeK < firstMonth.amortizationSeK,
    }
  }, [projection, firstMonth, startDate])

  return {
    hasPlan: projection.months.length > 0,
    monthlyPaymentSeK,
    monthlyInterestSeK,
    monthlyAmortizationSeK,
    monthlyNetPaymentSeK: monthlyPaymentSeK - monthlyInterestDeductionSeK,
    totalHousingCostSeK: monthlyPaymentSeK + monthlyOperatingCostSeK + monthlyBudgetCostSeK,
    hasHousingExtras: monthlyOperatingCostSeK + monthlyBudgetCostSeK > 0,
    currentLoanToValueLabel: formatLoanToValue(projection.initialLoanToValue),
    milestones,
    nextChange,
  }
}
