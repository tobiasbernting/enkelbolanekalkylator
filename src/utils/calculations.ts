/**
 * Mortgage Calculation Utilities
 */

export interface LoanCalculation {
  loanAmountSeK: number;
  monthlyPaymentSeK: number;
  totalInterestSeK: number;
  totalCostSeK: number;
}

export interface LoanPortion {
  id: string;
  bankId: string;
  amountSeK: number;
  termYears: number;
  interestRate: number;
}

export interface PortionDetail {
  id: string;
  bankId: string;
  amountSeK: number;
  termYears: number;
  interestRate: number;
  monthlyPaymentSeK: number;
  totalInterestSeK: number;
}

export interface AmortizationRow {
  period: number;
  paymentNumber: number;
  monthlyPaymentSeK: number;
  annualPaymentSeK: number;
  principalSeK: number;
  annualPrincipalSeK: number;
  interestSeK: number;
  annualInterestSeK: number;
  remainingBalanceSeK: number;
}

/**
 * Calculate monthly payment using the standard loan payment formula
 * Formula: P × [r(1+r)^n] / [(1+r)^n - 1]
 * P = Loan amount
 * r = Monthly interest rate
 * n = Total number of payments
 */
export function calculateMonthlyPayment(
  loanAmountSeK: number,
  annualInterestRate: number,
  loanTermYears: number
): number {
  if (loanAmountSeK <= 0 || loanTermYears <= 0) {
    return 0;
  }

  const monthlyRate = annualInterestRate / 100 / 12;
  const numberOfPayments = loanTermYears * 12;

  // Handle 0% interest rate
  if (monthlyRate === 0) {
    return loanAmountSeK / numberOfPayments;
  }

  const numerator = monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments);
  const denominator = Math.pow(1 + monthlyRate, numberOfPayments) - 1;
  const monthlyPayment = loanAmountSeK * (numerator / denominator);

  return monthlyPayment;
}

/**
 * Calculate total loan metrics
 */
export function calculateLoan(
  housePriceSeK: number,
  downPaymentSeK: number,
  annualInterestRate: number,
  loanTermYears: number
): LoanCalculation {
  const loanAmountSeK = housePriceSeK - downPaymentSeK;
  const monthlyPaymentSeK = calculateMonthlyPayment(
    loanAmountSeK,
    annualInterestRate,
    loanTermYears
  );
  const totalPaymentsSeK = monthlyPaymentSeK * loanTermYears * 12;
  const totalInterestSeK = totalPaymentsSeK - loanAmountSeK;
  const totalCostSeK = housePriceSeK + totalInterestSeK;

  return {
    loanAmountSeK: Math.max(0, loanAmountSeK),
    monthlyPaymentSeK: Math.max(0, monthlyPaymentSeK),
    totalInterestSeK: Math.max(0, totalInterestSeK),
    totalCostSeK: Math.max(0, totalCostSeK),
  };
}

/**
 * Calculate details for a single loan portion
 */
export function calculatePortionDetail(
  portion: LoanPortion
): PortionDetail {
  // During fixed-rate period (lopttid), we model interest-only payments.
  const monthlyPaymentSeK = portion.amountSeK * (portion.interestRate / 100 / 12);
  const totalInterestSeK = monthlyPaymentSeK * portion.termYears * 12;

  return {
    id: portion.id,
    bankId: portion.bankId,
    amountSeK: portion.amountSeK,
    termYears: portion.termYears,
    interestRate: portion.interestRate,
    monthlyPaymentSeK,
    totalInterestSeK,
  };
}

/**
 * Calculate aggregated loan metrics for multiple portions
 */
export function calculateMultipleLoans(
  housePriceSeK: number,
  downPaymentSeK: number,
  portions: LoanPortion[]
): {
  amountToFinanceSeK: number;
  totalLoanAmountSeK: number;
  totalMonthlyPaymentSeK: number;
  totalInterestSeK: number;
  totalCostSeK: number;
  portionDetails: PortionDetail[];
} {
  const amountToFinanceSeK = housePriceSeK - downPaymentSeK;
  
  // If no portions defined, return empty result
  if (portions.length === 0) {
    return {
      amountToFinanceSeK,
      totalLoanAmountSeK: 0,
      totalMonthlyPaymentSeK: 0,
      totalInterestSeK: 0,
      totalCostSeK: housePriceSeK,
      portionDetails: [],
    };
  }

  const portionDetails = portions.map(portion => calculatePortionDetail(portion));

  const totalLoanAmountSeK = portionDetails.reduce((sum, p) => sum + p.amountSeK, 0);
  const totalMonthlyPaymentSeK = portionDetails.reduce((sum, p) => sum + p.monthlyPaymentSeK, 0);
  const totalInterestSeK = portionDetails.reduce((sum, p) => sum + p.totalInterestSeK, 0);
  const totalCostSeK = housePriceSeK + totalInterestSeK;

  return {
    amountToFinanceSeK,
    totalLoanAmountSeK,
    totalMonthlyPaymentSeK,
    totalInterestSeK,
    totalCostSeK,
    portionDetails,
  };
}

/**
 * Generate amortization schedule (yearly view) for single loan
 */
export function generateAmortizationSchedule(
  loanAmountSeK: number,
  annualInterestRate: number,
  loanTermYears: number
): AmortizationRow[] {
  const schedule: AmortizationRow[] = [];

  if (loanAmountSeK <= 0 || loanTermYears <= 0) {
    return schedule;
  }

  const monthlyRate = annualInterestRate / 100 / 12;
  const monthlyPayment = calculateMonthlyPayment(
    loanAmountSeK,
    annualInterestRate,
    loanTermYears
  );

  let remainingBalance = loanAmountSeK;
  let paymentNumber = 0;

  for (let year = 1; year <= loanTermYears; year++) {
    let annualInterest = 0;
    let annualPrincipal = 0;

    for (let month = 0; month < 12; month++) {
      paymentNumber++;

      // Calculate interest for this payment
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;

      annualInterest += interestPayment;
      annualPrincipal += principalPayment;
      remainingBalance -= principalPayment;

      // Ensure balance doesn't go negative due to rounding
      if (remainingBalance < 0) {
        remainingBalance = 0;
      }
    }

    schedule.push({
      period: year,
      paymentNumber: paymentNumber,
      monthlyPaymentSeK: monthlyPayment,
      annualPaymentSeK: monthlyPayment * 12,
      principalSeK: annualPrincipal / 12,
      annualPrincipalSeK: annualPrincipal,
      interestSeK: annualInterest / 12,
      annualInterestSeK: annualInterest,
      remainingBalanceSeK: remainingBalance,
    });
  }

  return schedule;
}

/**
 * Generate scenario matrix for comparison
 */
export interface ScenarioResult {
  loanAmountSeK: number;
  downPaymentPercent: number;
  downPaymentSeK: number;
  interestRate: number;
  monthlyPaymentSeK: number;
  monthlyInterestSeK: number;
  monthlyAmortizationSeK: number;
  amortizationRate: number;
  totalInterestSeK: number;
  totalCostSeK: number;
}

/** Bolånetak: a new mortgage may be at most 90% of the property value (since 2026-04-01). */
export const MAX_LOAN_TO_VALUE = 0.9;

/**
 * Amorteringskrav enligt lag (2026:226) om begränsning av bostadskrediter, gäller
 * från 2026-04-01: 2% per år vid belåningsgrad över 70%, 1% över 50%, annars 0%.
 * The earlier extra +1% for loans above 4.5× gross income (skärpt amorteringskrav)
 * was removed by the same law, so income no longer affects the requirement.
 */
export function calculateRequiredAmortizationRate(
  loanAmountSeK: number,
  housePriceSeK: number
): number {
  const ltv = housePriceSeK > 0 ? loanAmountSeK / housePriceSeK : 0;

  return ltv > 0.7 ? 0.02 : ltv > 0.5 ? 0.01 : 0;
}

/**
 * Swedish ränteavdrag: 30% on the first 100 000 kr of interest per borrower
 * and year, 21% on the part above.
 */
export function calculateYearlyInterestDeduction(
  yearlyInterestSeK: number,
  numberOfBorrowers = 1
): number {
  const annualInterestSeK = Math.max(0, yearlyInterestSeK);
  const thresholdSeK = Math.max(1, numberOfBorrowers) * 100000;
  const deductionUpToThresholdSeK = Math.min(annualInterestSeK, thresholdSeK) * 0.3;
  const deductionAboveThresholdSeK = Math.max(0, annualInterestSeK - thresholdSeK) * 0.21;

  return deductionUpToThresholdSeK + deductionAboveThresholdSeK;
}

/**
 * Month-by-month projection of a mortgage with straight amortization.
 *
 * Amortization per month depends on the mode:
 * - 'requirement': exactly amorteringskravet, recalculated each month from the current
 *   belåningsgrad, so it steps down from 2% to 1% to 0% as the loan passes 70% and 50%.
 *   Like the banks, the percentage applies to the amortization basis (the debt when the
 *   requirement was set), not to the shrinking balance.
 * - 'fixed': the chosen amount every month. When `enforceRequirement` is true (new loans)
 *   it is never lower than the requirement for that month.
 *
 * The property value is held constant and interest uses the loan's weighted average rate,
 * which stays constant because amortization is split across portions by their balance.
 */
export type AmortizationPlanMode = 'requirement' | 'fixed';

export interface ProjectionInput {
  portions: LoanPortion[];
  housePriceSeK: number;
  amortizationMode: AmortizationPlanMode;
  fixedMonthlyAmortizationSeK: number;
  enforceRequirement: boolean;
  /** Debt the requirement percentage is applied to. Defaults to the sum of the portions. */
  amortizationBasisSeK?: number;
  maxMonths?: number;
}

export interface ProjectionMonth {
  /** 1 = the first payment. */
  month: number;
  openingBalanceSeK: number;
  interestSeK: number;
  amortizationSeK: number;
  paymentSeK: number;
  closingBalanceSeK: number;
  /** Belåningsgrad after this month's payment, 0-1. */
  closingLoanToValue: number;
  requiredRate: number;
}

export interface ProjectionYear {
  /** 1 = the first twelve payments. */
  year: number;
  interestSeK: number;
  amortizationSeK: number;
  paymentSeK: number;
  /** Payment in the year's first month, i.e. what you pay per month at the start of the year. */
  firstMonthPaymentSeK: number;
  closingBalanceSeK: number;
  closingLoanToValue: number;
  requiredRate: number;
  milestones: LoanToValueMilestone[];
}

export type LoanToValueMilestone = 'below70' | 'below50' | 'debtFree';

export interface MortgageProjection {
  initialBalanceSeK: number;
  initialLoanToValue: number;
  averageRatePercent: number;
  months: ProjectionMonth[];
  years: ProjectionYear[];
  /** Month number (1-based) when each milestone is reached; 0 = already reached; null = not within the projection. */
  milestoneMonths: Record<LoanToValueMilestone, number | null>;
  totalInterestSeK: number;
  /** True when the loan is not paid off within maxMonths. */
  isTruncated: boolean;
}

const LTV_EPSILON = 1e-9;
const BALANCE_EPSILON_SEK = 0.005;

export function projectMortgage({
  portions,
  housePriceSeK,
  amortizationMode,
  fixedMonthlyAmortizationSeK,
  enforceRequirement,
  amortizationBasisSeK,
  maxMonths = 100 * 12,
}: ProjectionInput): MortgageProjection {
  const initialBalanceSeK = portions.reduce((sum, p) => sum + Math.max(0, p.amountSeK), 0);
  const averageRatePercent =
    initialBalanceSeK > 0
      ? portions.reduce((sum, p) => sum + Math.max(0, p.amountSeK) * Math.max(0, p.interestRate), 0) /
        initialBalanceSeK
      : 0;
  const monthlyRate = averageRatePercent / 100 / 12;
  const basisSeK = Math.max(0, amortizationBasisSeK ?? initialBalanceSeK);
  const toLoanToValue = (balance: number) => (housePriceSeK > 0 ? balance / housePriceSeK : 0);
  const initialLoanToValue = toLoanToValue(initialBalanceSeK);

  const milestoneMonths: Record<LoanToValueMilestone, number | null> = {
    below70: initialLoanToValue <= 0.7 + LTV_EPSILON ? 0 : null,
    below50: initialLoanToValue <= 0.5 + LTV_EPSILON ? 0 : null,
    debtFree: initialBalanceSeK <= 0 ? 0 : null,
  };

  const months: ProjectionMonth[] = [];
  let balance = initialBalanceSeK;
  let totalInterestSeK = 0;

  for (let month = 1; month <= maxMonths && balance > BALANCE_EPSILON_SEK; month++) {
    const requiredRate = calculateRequiredAmortizationRate(balance, housePriceSeK);
    const requiredAmountSeK = (basisSeK * requiredRate) / 12;
    const plannedSeK =
      amortizationMode === 'requirement'
        ? requiredAmountSeK
        : enforceRequirement
          ? Math.max(fixedMonthlyAmortizationSeK, requiredAmountSeK)
          : Math.max(0, fixedMonthlyAmortizationSeK);
    const amortizationSeK = Math.min(balance, plannedSeK);
    const interestSeK = balance * monthlyRate;
    const closingBalanceSeK = balance - amortizationSeK;
    const closingLoanToValue = toLoanToValue(closingBalanceSeK);

    months.push({
      month,
      openingBalanceSeK: balance,
      interestSeK,
      amortizationSeK,
      paymentSeK: interestSeK + amortizationSeK,
      closingBalanceSeK,
      closingLoanToValue,
      requiredRate,
    });

    if (milestoneMonths.below70 === null && closingLoanToValue <= 0.7 + LTV_EPSILON) {
      milestoneMonths.below70 = month;
    }
    if (milestoneMonths.below50 === null && closingLoanToValue <= 0.5 + LTV_EPSILON) {
      milestoneMonths.below50 = month;
    }
    if (closingBalanceSeK <= BALANCE_EPSILON_SEK) {
      milestoneMonths.debtFree = month;
    }

    totalInterestSeK += interestSeK;
    balance = closingBalanceSeK;

    // Nothing more will change once there is no amortization: stop instead of looping.
    if (amortizationSeK <= 0 && month >= 12) {
      break;
    }
  }

  const years: ProjectionYear[] = [];
  for (let start = 0; start < months.length; start += 12) {
    const slice = months.slice(start, start + 12);
    const last = slice[slice.length - 1];
    const year = start / 12 + 1;
    const milestones = (Object.keys(milestoneMonths) as LoanToValueMilestone[]).filter((key) => {
      const reachedAt = milestoneMonths[key];
      return reachedAt !== null && reachedAt > start && reachedAt <= start + 12;
    });
    years.push({
      year,
      interestSeK: slice.reduce((sum, m) => sum + m.interestSeK, 0),
      amortizationSeK: slice.reduce((sum, m) => sum + m.amortizationSeK, 0),
      paymentSeK: slice.reduce((sum, m) => sum + m.paymentSeK, 0),
      firstMonthPaymentSeK: slice[0].paymentSeK,
      closingBalanceSeK: last.closingBalanceSeK,
      closingLoanToValue: last.closingLoanToValue,
      requiredRate: slice[0].requiredRate,
      milestones,
    });
  }

  return {
    initialBalanceSeK,
    initialLoanToValue,
    averageRatePercent,
    months,
    years,
    milestoneMonths,
    totalInterestSeK,
    isTruncated: balance > BALANCE_EPSILON_SEK,
  };
}

/** Applies a rate change (percentage points) to every portion; rates never go below 0. */
export function applyRateChange(portions: LoanPortion[], rateChangePercentPoints: number): LoanPortion[] {
  if (rateChangePercentPoints === 0) {
    return portions;
  }

  return portions.map((portion) => ({
    ...portion,
    interestRate: Math.max(0, portion.interestRate + rateChangePercentPoints),
  }));
}

export function generateScenarios(
  housePriceSeK: number,
  loanAmountsSeK: number[],
  interestRates: number[],
  loanTermYears: number,
  minimumMonthlyAmortizationSeK = 0
): ScenarioResult[] {
  const scenarios: ScenarioResult[] = [];

  for (const rawLoanAmountSeK of loanAmountsSeK) {
    const loanAmountSeK = Math.max(0, rawLoanAmountSeK)
    const downPaymentSeK = Math.max(0, housePriceSeK - loanAmountSeK)
    const downPaymentPercent =
      housePriceSeK > 0 ? (downPaymentSeK / housePriceSeK) * 100 : 0

    for (const interestRate of interestRates) {
      const monthlyInterestSeK = loanAmountSeK * (interestRate / 100 / 12);
      const amortizationRate = calculateRequiredAmortizationRate(
        loanAmountSeK,
        housePriceSeK
      );
      const monthlyAmortizationSeK = Math.max(
        (loanAmountSeK * amortizationRate) / 12,
        minimumMonthlyAmortizationSeK
      );
      const monthlyPaymentSeK = monthlyInterestSeK + monthlyAmortizationSeK;
      const totalInterestSeK = monthlyInterestSeK * loanTermYears * 12;
      const totalCostSeK = housePriceSeK + totalInterestSeK;

      scenarios.push({
        loanAmountSeK,
        downPaymentPercent,
        downPaymentSeK,
        interestRate,
        monthlyPaymentSeK,
        monthlyInterestSeK,
        monthlyAmortizationSeK,
        amortizationRate,
        totalInterestSeK,
        totalCostSeK,
      });
    }
  }

  return scenarios;
}

/**
 * Format SEK amount as string
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage with 2 decimal places
 */
export function formatPercent(percent: number): string {
  return `${percent.toFixed(2)}%`;
}
