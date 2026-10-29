import type { LoanPortion } from './calculations'
import type { LoanMode } from '../hooks/useMortgageState'

interface MortgageFormCompletionInput {
  loanMode?: LoanMode
  housePrice: number
  downPayment: number
  monthlyIncome: number
  loanPortions: LoanPortion[]
}

export function isMortgageFormComplete({
  loanMode = 'new',
  housePrice,
  downPayment,
  monthlyIncome,
  loanPortions,
}: MortgageFormCompletionInput): boolean {
  if (!Number.isFinite(housePrice) || housePrice <= 0) {
    return false
  }

  if (!Number.isFinite(downPayment) || downPayment < 0 || downPayment >= housePrice) {
    return false
  }

  // Income only affects the skuldkvot rule, so it is optional for an existing loan.
  const isIncomeRequired = loanMode === 'new'
  if (!Number.isFinite(monthlyIncome) || monthlyIncome < 0 || (isIncomeRequired && monthlyIncome <= 0)) {
    return false
  }

  if (loanPortions.length === 0) {
    return false
  }

  const hasInvalidPortion = loanPortions.some(
    (portion) =>
      !Number.isFinite(portion.amountSeK) ||
      portion.amountSeK <= 0 ||
      !Number.isFinite(portion.termYears) ||
      portion.termYears <= 0 ||
      !Number.isFinite(portion.interestRate) ||
      portion.interestRate < 0
  )

  return !hasInvalidPortion
}