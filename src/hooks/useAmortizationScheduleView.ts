import { useMemo } from 'react'
import type { LoanToValueMilestone, MortgageProjection } from '../utils/calculations'
import { formatLoanToValue, getDateForPaymentMonth } from '../utils/planFormatting'

interface UseAmortizationScheduleViewParams {
  projection: MortgageProjection
  startDate: Date
}

export interface AmortizationScheduleRow {
  year: number
  calendarYearLabel: string
  loanToValueLabel: string
  closingBalanceSeK: number
  monthlyPaymentSeK: number
  interestSeK: number
  amortizationSeK: number
  requirementLabel: string
  milestones: string[]
}

export interface AmortizationScheduleViewModel {
  hasRows: boolean
  rows: AmortizationScheduleRow[]
  isTruncated: boolean
  totalInterestSeK: number
}

const MILESTONE_BADGES: Record<LoanToValueMilestone, string> = {
  below70: 'Under 70 %',
  below50: 'Under 50 %',
  debtFree: 'Skuldfri',
}

export function useAmortizationScheduleView({
  projection,
  startDate,
}: UseAmortizationScheduleViewParams): AmortizationScheduleViewModel {
  const rows = useMemo(
    () =>
      projection.years.map((year) => {
        const firstMonth = (year.year - 1) * 12 + 1
        const startYear = getDateForPaymentMonth(startDate, firstMonth).getFullYear()
        const endYear = getDateForPaymentMonth(startDate, firstMonth + 11).getFullYear()

        return {
          year: year.year,
          calendarYearLabel: startYear === endYear ? String(startYear) : `${startYear}–${String(endYear).slice(2)}`,
          loanToValueLabel: formatLoanToValue(year.closingLoanToValue),
          closingBalanceSeK: year.closingBalanceSeK,
          monthlyPaymentSeK: year.firstMonthPaymentSeK,
          interestSeK: year.interestSeK,
          amortizationSeK: year.amortizationSeK,
          requirementLabel: `${(year.requiredRate * 100).toLocaleString('sv-SE')} %`,
          milestones: year.milestones.map((milestone) => MILESTONE_BADGES[milestone]),
        }
      }),
    [projection, startDate]
  )

  return {
    hasRows: rows.length > 0,
    rows,
    isTruncated: projection.isTruncated,
    totalInterestSeK: projection.totalInterestSeK,
  }
}
