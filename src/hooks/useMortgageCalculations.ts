import { useMemo } from 'react'
import {
  BANK_RATE_PRESETS,
  getEffectiveRateForPortion,
  getEffectiveRatesByType,
  getRatesByType,
  type BankRateType,
} from '../data/bankRates'
import type { BankComparisonRow } from '../types/bankComparison'
import type { MonthlyBudgetItem } from '../types/monthlyBudget'
import type { LoanMode } from './useMortgageState'
import {
  calculateMultipleLoans,
  calculateRequiredAmortizationRate,
  calculateYearlyInterestDeduction,
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
  monthlyBudgetItems: MonthlyBudgetItem[]
  selectedBank: string
  selectedRateType: BankRateType
  numberOfBorrowers: 1 | 2
  loanPortions: LoanPortion[]
  loanMode?: LoanMode
  isMonthlyAmortizationUserSet?: boolean
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
  mortgageMonthlyCostSeK: number
  monthlyBudgetCostSeK: number
  totalMonthlyCost: number
  selectedNominalRatePercent: number
  selectedEffectiveRatePercent: number
  selectedEffectiveMonthlyInterestSeK: number
  selectedMonthlyInterestDeductionSeK: number
  selectedYearlyInterestDeductionSeK: number
  selectedYearlyInterestDeductionPerBorrowerSeK: number
  selectedMonthlyInterestDeductionRatePercent: number
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
  monthlyBudgetItems,
  selectedBank,
  selectedRateType,
  numberOfBorrowers,
  loanPortions,
  loanMode = 'new',
  isMonthlyAmortizationUserSet = false,
}: UseMortgageCalculationsParams): UseMortgageCalculationsResult {
  const annualIncome = useMemo(() => monthlyIncome * 12, [monthlyIncome])

  const effectivePortions = useMemo(() => {
    if (loanPortions.length > 0) {
      return loanPortions
    }

    const amountToFinanceSeK = Math.max(0, housePrice - downPayment)
    if (amountToFinanceSeK <= 0) {
      return []
    }

    const selectedPreset = BANK_RATE_PRESETS.find((preset) => preset.id === selectedBank)
    const ratesByTerm = selectedPreset ? getRatesByType(selectedPreset, selectedRateType) : {}
    const defaultTermYears =
      Object.keys(ratesByTerm)
        .map((term) => Number(term))
        .filter((term) => Number.isFinite(term) && term > 0)
        .sort((a, b) => a - b)[0] ?? 3

    const defaultRate = ratesByTerm[defaultTermYears] ?? 0

    return [
      {
        id: 'auto-generated-portion',
        bankId: selectedBank,
        amountSeK: amountToFinanceSeK,
        termYears: defaultTermYears,
        interestRate: defaultRate,
      },
    ]
  }, [loanPortions, housePrice, downPayment, selectedBank, selectedRateType])

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

    const baseRate = ltv > 0.7 ? 0.02 : ltv > 0.5 ? 0.01 : 0
    const additionalRate = annualIncome > 0 && debtToIncomeRatio > 4.5 ? 0.01 : 0

    const baseReason =
      baseRate === 0.02
        ? 'Belåningsgrad över 70 % ger 2,0 %'
        : baseRate === 0.01
          ? 'Belåningsgrad över 50 % (upp till 70 %) ger 1,0 %'
          : 'Belåningsgrad på högst 50 % ger 0,0 %'

    const debtReason =
      additionalRate > 0
        ? 'Skuldkvot över 4,5 gånger inkomsten lägger till +1,0 %'
        : 'Ingen extra +1,0 % från skuldkvot'

    return `${baseReason}. ${debtReason}. Belåningsgrad: ${(ltv * 100).toFixed(1)} %. Skuldkvot: ${Number.isFinite(debtToIncomeRatio) ? `${debtToIncomeRatio.toFixed(2)}x` : 'saknas (ingen inkomst)'}.`
  }, [requiredLoanAmountForRules, housePrice, annualIncome])

  const requiredMonthlyAmortization = useMemo(
    () => (requiredLoanAmountForRules * requiredAmortizationRate) / 12,
    [requiredLoanAmountForRules, requiredAmortizationRate]
  )

  // A new loan must follow amorteringskravet. An existing loan may legitimately
  // amortize less (e.g. loans from before 2016, or a requirement based on an older
  // valuation), so a manually entered amount is used as is.
  const effectiveMonthlyAmortization = useMemo(
    () =>
      loanMode === 'existing' && isMonthlyAmortizationUserSet
        ? Math.max(0, monthlyAmortization)
        : Math.max(requiredMonthlyAmortization, monthlyAmortization),
    [loanMode, isMonthlyAmortizationUserSet, requiredMonthlyAmortization, monthlyAmortization]
  )

  const monthlyBudgetCostSeK = useMemo(
    () =>
      monthlyBudgetItems.reduce(
        (sum, item) => sum + Math.max(0, Number.isFinite(item.amountSeK) ? item.amountSeK : 0),
        0
      ),
    [monthlyBudgetItems]
  )

  const mortgageMonthlyCostSeK = useMemo(
    () => loanCalculation.monthlyPaymentSeK + effectiveMonthlyAmortization + monthlyOperatingCost,
    [loanCalculation.monthlyPaymentSeK, effectiveMonthlyAmortization, monthlyOperatingCost]
  )

  const totalMonthlyCost = useMemo(
    () => mortgageMonthlyCostSeK + monthlyBudgetCostSeK,
    [mortgageMonthlyCostSeK, monthlyBudgetCostSeK]
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

      const bankMonthlyAmortizationSeK = effectiveMonthlyAmortization

      const monthlyPaymentSeK =
        bankCalculation.totalMonthlyPaymentSeK +
        bankMonthlyAmortizationSeK +
        monthlyOperatingCost +
        monthlyBudgetCostSeK
      const monthlyEffectivePaymentSeK =
        bankEffectiveCalculation.totalMonthlyPaymentSeK +
        bankMonthlyAmortizationSeK +
        monthlyOperatingCost +
        monthlyBudgetCostSeK

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
        monthlyBudgetCostSeK,
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
    effectiveMonthlyAmortization,
    monthlyOperatingCost,
    monthlyBudgetCostSeK,
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

  // Rates shown for "your" loan come from the portions themselves, so custom rates
  // (e.g. an existing loan) are respected instead of being replaced by bank presets.
  const selectedNominalRatePercent =
    loanCalculation.loanAmountSeK > 0
      ? (loanCalculation.monthlyPaymentSeK * 12 * 100) / loanCalculation.loanAmountSeK
      : 0

  const selectedEffectiveMonthlyInterestSeK = useMemo(
    () =>
      effectivePortions.reduce(
        (sum, portion) =>
          sum + (portion.amountSeK * getEffectiveRateForPortion(portion, selectedRateType)) / 100 / 12,
        0
      ),
    [effectivePortions, selectedRateType]
  )

  const selectedEffectiveRatePercent =
    loanCalculation.loanAmountSeK > 0
      ? (selectedEffectiveMonthlyInterestSeK * 12 * 100) / loanCalculation.loanAmountSeK
      : selectedNominalRatePercent
  const selectedEffectiveMonthlyCostSeK =
    selectedEffectiveMonthlyInterestSeK +
    effectiveMonthlyAmortization +
    monthlyOperatingCost +
    monthlyBudgetCostSeK

  const estimatedYearlyInterestSeK = useMemo(() => {
    const openingDebt = Math.max(0, loanCalculation.loanAmountSeK)
    const monthlyAmortizationSeK = Math.max(0, effectiveMonthlyAmortization)
    const monthlyRate = Math.max(0, selectedNominalRatePercent) / 100 / 12

    let annualInterestSeK = 0
    for (let month = 0; month < 12; month += 1) {
      const monthOpeningDebt = Math.max(0, openingDebt - month * monthlyAmortizationSeK)
      annualInterestSeK += monthOpeningDebt * monthlyRate
    }

    return annualInterestSeK
  }, [loanCalculation.loanAmountSeK, effectiveMonthlyAmortization, selectedNominalRatePercent])

  const selectedYearlyInterestDeductionSeK = useMemo(
    () => calculateYearlyInterestDeduction(estimatedYearlyInterestSeK, numberOfBorrowers),
    [estimatedYearlyInterestSeK, numberOfBorrowers]
  )

  const selectedMonthlyInterestDeductionSeK = selectedYearlyInterestDeductionSeK / 12
  const selectedYearlyInterestDeductionPerBorrowerSeK =
    selectedYearlyInterestDeductionSeK / numberOfBorrowers

  const selectedMonthlyInterestDeductionRatePercent =
    loanCalculation.monthlyPaymentSeK > 0
      ? (selectedMonthlyInterestDeductionSeK / loanCalculation.monthlyPaymentSeK) * 100
      : 0
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
    mortgageMonthlyCostSeK,
    monthlyBudgetCostSeK,
    totalMonthlyCost,
    selectedNominalRatePercent,
    selectedEffectiveRatePercent,
    selectedEffectiveMonthlyInterestSeK,
    selectedMonthlyInterestDeductionSeK,
    selectedYearlyInterestDeductionSeK,
    selectedYearlyInterestDeductionPerBorrowerSeK,
    selectedMonthlyInterestDeductionRatePercent,
    selectedEffectiveMonthlyCostSeK,
    selectedEffectiveYearlyCostSeK,
    perBankSummary,
    amortizationSchedule,
  }
}
