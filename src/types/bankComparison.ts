export interface BankComparisonRow {
  bankId: string
  bankLabel: string
  loanAmountSeK: number
  effectiveRatePercent: number
  portionRates: Array<{
    id: string
    termYears: number
    ratePercent: number
  }>
  monthlyInterestSeK: number
  monthlyAmortizationSeK: number
  monthlyPaymentSeK: number
  requiredAmortizationRate: number
  totalInterestSeK: number
  totalCostSeK: number
}
