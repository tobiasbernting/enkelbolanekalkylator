import type { LoanPortion } from './calculations'

interface MortgageFormCompletionInput {
  housePrice: number
  downPayment: number
  monthlyIncome: number
  loanPortions: LoanPortion[]
}

export function isMortgageFormComplete({
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

  if (!Number.isFinite(monthlyIncome) || monthlyIncome <= 0) {
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