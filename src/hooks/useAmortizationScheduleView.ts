import { useMemo } from 'react'
import {
  calculateRequiredAmortizationRate,
  type AmortizationRow,
} from '../utils/calculations'

interface UseAmortizationScheduleViewParams {
  schedule: AmortizationRow[]
  initialLoanAmount: number
  housePrice: number
}

export interface AmortizationScheduleViewModel {
  hasPrincipalReduction: boolean
  currentRate: number
  yearAt70: number | null
  yearAt50: number | null
  getMilestonesForYear: (year: number) => string[]
}

function findYearForBalance(schedule: AmortizationRow[], thresholdBalance: number): number | null {
  const hit = schedule.find((row) => row.remainingBalanceSeK <= thresholdBalance)
  return hit ? hit.period : null
}

export function useAmortizationScheduleView({
  schedule,
  initialLoanAmount,
  housePrice,
}: UseAmortizationScheduleViewParams): AmortizationScheduleViewModel {
  const hasPrincipalReduction = useMemo(
    () => schedule.some((row) => row.annualPrincipalSeK > 0),
    [schedule]
  )

  const yearAt70 = useMemo(
    () => findYearForBalance(schedule, housePrice * 0.7),
    [schedule, housePrice]
  )
  const yearAt50 = useMemo(
    () => findYearForBalance(schedule, housePrice * 0.5),
    [schedule, housePrice]
  )

  const currentRate = useMemo(
    () => calculateRequiredAmortizationRate(initialLoanAmount, housePrice),
    [initialLoanAmount, housePrice]
  )

  const getMilestonesForYear = (year: number): string[] => {
    const milestones: string[] = []
    if (yearAt70 === year) milestones.push('70% nådd')
    if (yearAt50 === year) milestones.push('50% nådd')
    return milestones
  }

  return {
    hasPrincipalReduction,
    currentRate,
    yearAt70,
    yearAt50,
    getMilestonesForYear,
  }
}
