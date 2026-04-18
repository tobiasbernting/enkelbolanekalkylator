import { useMemo } from 'react'
import {
  BANK_RATE_PRESETS,
  getEffectiveRatesByType,
  getRatesByType,
  type BankRateType,
} from '../data/bankRates'
import type { BankComparisonRow } from '../types/bankComparison'
import {
  calculateMultipleLoans,
  calculateRequiredAmortizationRate,
  generateCombinedAmortizationSchedule,
  type AmortizationRow,
  type LoanPortion,
} from '../utils/calculations'

interface UseMortgageCalculationsParams {
  housePrice: number
  downPayment: number
  monthlyIncome: number
  monthlyAmortization: number
  monthlyOperatingCost: number
  loanTerm: number
  selectedBank: string
  selectedRateType: BankRateType
  loanPortions: LoanPortion[]
}

interface MortgageLoanCalculation {
  amountToFinanceSeK: number
  loanAmountSeK: number
  monthlyPaymentSeK: number
  totalInterestSeK: number
  totalCostSeK: number
  portionDetails: ReturnType<typeof calculateMultipleLoans>['portionDetails']
}

interface UseMortgageCalculationsResult {
  annualIncome: number
  effectivePortions: LoanPortion[]
  loanCalculation: MortgageLoanCalculation
  requiredLoanAmountForRules: number
  requiredAmortizationRate: number
  amortizationExplanation: string
  requiredMonthlyAmortization: number
  effectiveMonthlyAmortization: number
  totalMonthlyCost: number
  selectedNominalRatePercent: number
  selectedEffectiveRatePercent: number
  selectedEffectiveMonthlyInterestSeK: number
  selectedEffectiveMonthlyCostSeK: number
  selectedEffectiveYearlyCostSeK: number
  perBankSummary: BankComparisonRow[]
  amortizationSchedule: AmortizationRow[]
}

export function useMortgageCalculations({
  housePrice,
  downPayment,
  monthlyIncome,
  monthlyAmortization,
  monthlyOperatingCost,
  loanTerm,
  selectedBank,
  selectedRateType,
  loanPortions,
}: UseMortgageCalculationsParams): UseMortgageCalculationsResult {
  const annualIncome = useMemo(() => monthlyIncome * 12, [monthlyIncome])

  const effectivePortions = useMemo(() => {
    if (loanPortions.length > 0) {
      return loanPortions
    }

    const amountToFinance = Math.max(0, housePrice - downPayment)
    if (amountToFinance <= 0) {
      return [] as LoanPortion[]
    }

    return [
      {
        id: 'default-portion',
        bankId: selectedBank,
        amountSeK: amountToFinance,
        termYears: loanTerm,
        interestRate: 6,
      },
    ]
  }, [housePrice, downPayment, loanPortions, loanTerm, selectedBank])

  const loanCalculation = useMemo(() => {
    const multiLoan = calculateMultipleLoans(housePrice, downPayment, effectivePortions)

    return {
      amountToFinanceSeK: multiLoan.amountToFinanceSeK,
      loanAmountSeK: multiLoan.totalLoanAmountSeK,
      monthlyPaymentSeK: multiLoan.totalMonthlyPaymentSeK,
      totalInterestSeK: multiLoan.totalInterestSeK,
      totalCostSeK: multiLoan.totalCostSeK,
      portionDetails: multiLoan.portionDetails,
    }
  }, [housePrice, downPayment, effectivePortions])

  const requiredLoanAmountForRules = useMemo(
    () => Math.max(0, housePrice - downPayment),
    [housePrice, downPayment]
  )

  const requiredAmortizationRate = useMemo(
    () =>
      calculateRequiredAmortizationRate(
        requiredLoanAmountForRules,
        housePrice,
        annualIncome
      ),
    [requiredLoanAmountForRules, housePrice, annualIncome]
  )

  const amortizationExplanation = useMemo(() => {
    const loanAmount = requiredLoanAmountForRules
    const ltv = housePrice > 0 ? loanAmount / housePrice : 0
    const debtToIncomeRatio = annualIncome > 0 ? loanAmount / annualIncome : Infinity

    const baseRate = ltv > 0.7 ? 0.02 : ltv >= 0.5 ? 0.01 : 0
    const additionalRate = annualIncome > 0 && debtToIncomeRatio > 4.5 ? 0.01 : 0

    const baseReason =
      baseRate === 0.02
        ? 'Belaningsgrad over 70% ger 2.0%'
        : baseRate === 0.01
          ? 'Belaningsgrad mellan 50-70% ger 1.0%'
          : 'Belaningsgrad under 50% ger 0.0%'

    const debtReason =
      additionalRate > 0
        ? 'Skuldkvot over 4.5x lagger till +1.0%'
        : 'Ingen extra +1.0% fran skuldkvot'

    return `${baseReason}. ${debtReason}. Belaningsgrad: ${(ltv * 100).toFixed(1)}%. Skuldkvot: ${Number.isFinite(debtToIncomeRatio) ? `${debtToIncomeRatio.toFixed(2)}x` : 'saknas (ingen inkomst)'}.`
  }, [requiredLoanAmountForRules, housePrice, annualIncome])

  const requiredMonthlyAmortization = useMemo(
    () => (requiredLoanAmountForRules * requiredAmortizationRate) / 12,
    [requiredLoanAmountForRules, requiredAmortizationRate]
  )

  const effectiveMonthlyAmortization = useMemo(
    () => Math.max(requiredMonthlyAmortization, monthlyAmortization),
    [requiredMonthlyAmortization, monthlyAmortization]
  )

  const totalMonthlyCost = useMemo(
    () => loanCalculation.monthlyPaymentSeK + effectiveMonthlyAmortization + monthlyOperatingCost,
    [loanCalculation.monthlyPaymentSeK, effectiveMonthlyAmortization, monthlyOperatingCost]
  )

  const perBankSummary = useMemo(() => {
    if (effectivePortions.length === 0) {
      return []
    }

    const comparisons = BANK_RATE_PRESETS.map((bank) => {
      const ratesByTerm = getRatesByType(bank, selectedRateType)
      const effectiveRatesByTerm = getEffectiveRatesByType(bank, selectedRateType)
      const bankPortions = effectivePortions.map((portion) => ({
        ...portion,
        interestRate: ratesByTerm[portion.termYears] ?? portion.interestRate,
      }))

      const bankEffectivePortions = effectivePortions.map((portion) => ({
        ...portion,
        interestRate: effectiveRatesByTerm[portion.termYears] ?? ratesByTerm[portion.termYears] ?? portion.interestRate,
      }))

      const portionRates = bankPortions.map((portion) => ({
        id: portion.id,
        termYears: portion.termYears,
        ratePercent: portion.interestRate,
        effectiveRatePercent:
          effectiveRatesByTerm[portion.termYears] ?? portion.interestRate,
      }))

      const bankCalculation = calculateMultipleLoans(
        housePrice,
        downPayment,
        bankPortions
      )
      const bankEffectiveCalculation = calculateMultipleLoans(
        housePrice,
        downPayment,
        bankEffectivePortions
      )

      const bankRequiredAmortizationRate = calculateRequiredAmortizationRate(
        requiredLoanAmountForRules,
        housePrice,
        annualIncome
      )

      const bankRequiredMonthlyAmortization =
        (requiredLoanAmountForRules * bankRequiredAmortizationRate) / 12
      const bankMonthlyAmortizationSeK = Math.max(
        bankRequiredMonthlyAmortization,
        monthlyAmortization
      )

      const monthlyPaymentSeK =
        bankCalculation.totalMonthlyPaymentSeK + bankMonthlyAmortizationSeK + monthlyOperatingCost
      const monthlyEffectivePaymentSeK =
        bankEffectiveCalculation.totalMonthlyPaymentSeK + bankMonthlyAmortizationSeK + monthlyOperatingCost

      const nominalRatePercent =
        bankCalculation.totalLoanAmountSeK > 0
          ? (bankCalculation.totalMonthlyPaymentSeK * 12 * 100) /
            bankCalculation.totalLoanAmountSeK
          : 0

      const effectiveRatePercent =
        bankEffectiveCalculation.totalLoanAmountSeK > 0
          ? (bankEffectiveCalculation.totalMonthlyPaymentSeK * 12 * 100) /
            bankEffectiveCalculation.totalLoanAmountSeK
          : nominalRatePercent

      return {
        bankId: bank.id,
        bankLabel: bank.label,
        loanAmountSeK: bankCalculation.totalLoanAmountSeK,
        nominalRatePercent,
        effectiveRatePercent,
        portionRates,
        monthlyInterestSeK: bankCalculation.totalMonthlyPaymentSeK,
        monthlyEffectiveInterestSeK: bankEffectiveCalculation.totalMonthlyPaymentSeK,
        monthlyOperatingCostSeK: monthlyOperatingCost,
        monthlyAmortizationSeK: bankMonthlyAmortizationSeK,
        monthlyPaymentSeK,
        monthlyEffectivePaymentSeK,
        requiredAmortizationRate: bankRequiredAmortizationRate,
        totalInterestSeK: bankCalculation.totalInterestSeK,
        totalCostSeK: bankCalculation.totalCostSeK,
        totalEffectiveInterestSeK: bankEffectiveCalculation.totalInterestSeK,
        totalEffectiveCostSeK: bankEffectiveCalculation.totalCostSeK,
      }
    })

    return comparisons.sort((a, b) => a.monthlyInterestSeK - b.monthlyInterestSeK)
  }, [
    effectivePortions,
    selectedRateType,
    housePrice,
    downPayment,
    annualIncome,
    monthlyAmortization,
    monthlyOperatingCost,
    requiredLoanAmountForRules,
  ])

  const amortizationSchedule = useMemo(
    () =>
      generateCombinedAmortizationSchedule(
        effectivePortions,
        housePrice,
        annualIncome,
        80,
        effectiveMonthlyAmortization
      ),
    [effectivePortions, housePrice, annualIncome, effectiveMonthlyAmortization]
  )

  const selectedBankSummary = useMemo(
    () => perBankSummary.find((row) => row.bankId === selectedBank),
    [perBankSummary, selectedBank]
  )

  const selectedNominalRatePercent = selectedBankSummary?.nominalRatePercent ?? 0
  const selectedEffectiveRatePercent =
    selectedBankSummary?.effectiveRatePercent ?? selectedNominalRatePercent
  const selectedEffectiveMonthlyInterestSeK =
    selectedBankSummary?.monthlyEffectiveInterestSeK ?? loanCalculation.monthlyPaymentSeK
  const selectedEffectiveMonthlyCostSeK =
    selectedBankSummary?.monthlyEffectivePaymentSeK ??
    (loanCalculation.monthlyPaymentSeK + effectiveMonthlyAmortization + monthlyOperatingCost)
  const selectedEffectiveYearlyCostSeK = selectedEffectiveMonthlyCostSeK * 12

  return {
    annualIncome,
    effectivePortions,
    loanCalculation,
    requiredLoanAmountForRules,
    requiredAmortizationRate,
    amortizationExplanation,
    requiredMonthlyAmortization,
    effectiveMonthlyAmortization,
    totalMonthlyCost,
    selectedNominalRatePercent,
    selectedEffectiveRatePercent,
    selectedEffectiveMonthlyInterestSeK,
    selectedEffectiveMonthlyCostSeK,
    selectedEffectiveYearlyCostSeK,
    perBankSummary,
    amortizationSchedule,
  }
}
