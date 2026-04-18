export interface BankComparisonRow {
  bankId: string
  bankLabel: string
  loanAmountSeK: number
  nominalRatePercent: number
  effectiveRatePercent: number
  portionRates: Array<{
    id: string
    termYears: number
    ratePercent: number
    effectiveRatePercent: number
  }>
  monthlyInterestSeK: number
  monthlyEffectiveInterestSeK: number
  monthlyOperatingCostSeK: number
  monthlyBudgetCostSeK: number
  monthlyAmortizationSeK: number
  monthlyPaymentSeK: number
  monthlyEffectivePaymentSeK: number
  requiredAmortizationRate: number
  totalInterestSeK: number
  totalCostSeK: number
  totalEffectiveInterestSeK: number
  totalEffectiveCostSeK: number
}
