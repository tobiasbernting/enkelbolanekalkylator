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
 * Generate combined amortization schedule for multiple loan portions
 */
export function generateCombinedAmortizationSchedule(
  portions: LoanPortion[],
  housePriceSeK: number,
  annualIncomeSeK: number,
  maxProjectionYears = 120,
  minimumMonthlyAmortizationSeK = 0
): AmortizationRow[] {
  const schedule: AmortizationRow[] = [];

  if (portions.length === 0) {
    return schedule;
  }

  // Initialize portion states
  const portionStates = portions.map(portion => ({
    ...portion,
    remainingBalance: portion.amountSeK,
    monthlyRate: portion.interestRate / 100 / 12,
  }));

  let paymentNumber = 0;

  for (let year = 1; year <= maxProjectionYears; year++) {
    let annualInterest = 0;
    let annualPrincipal = 0;
    let annualPayment = 0;

    for (let month = 0; month < 12; month++) {
      paymentNumber++;
      let monthlyPayment = 0;
      let monthlyInterest = 0;
      let monthlyPrincipal = 0;

      // Calculate payments for active portions
      const activePortions = portionStates.filter(
        (state) => state.remainingBalance > 0
      );

      const totalActiveBalance = activePortions.reduce(
        (sum, state) => sum + state.remainingBalance,
        0
      );

      const requiredRateThisMonth = calculateRequiredAmortizationRate(
        totalActiveBalance,
        housePriceSeK,
        annualIncomeSeK
      );
      const requiredMonthlyAmortizationSeK =
        Math.max(
          (totalActiveBalance * requiredRateThisMonth) / 12,
          minimumMonthlyAmortizationSeK
        );

      activePortions.forEach((state, index) => {
        const interestPayment = state.remainingBalance * state.monthlyRate;

        let amortizationPayment = 0;
        if (requiredMonthlyAmortizationSeK > 0 && totalActiveBalance > 0) {
          if (index === activePortions.length - 1) {
            const allocatedSoFar = activePortions
              .slice(0, -1)
              .reduce((sum, s) => sum + (requiredMonthlyAmortizationSeK * s.remainingBalance) / totalActiveBalance, 0);
            amortizationPayment = Math.max(0, requiredMonthlyAmortizationSeK - allocatedSoFar);
          } else {
            amortizationPayment = (requiredMonthlyAmortizationSeK * state.remainingBalance) / totalActiveBalance;
          }
        }

        const principalPayment = Math.min(amortizationPayment, state.remainingBalance);

        monthlyInterest += interestPayment;
        monthlyPrincipal += principalPayment;
        monthlyPayment += interestPayment + principalPayment;
        state.remainingBalance -= principalPayment;

        // Ensure balance doesn't go negative
        if (state.remainingBalance < 0) {
          state.remainingBalance = 0;
        }
      });

      annualInterest += monthlyInterest;
      annualPrincipal += monthlyPrincipal;
      annualPayment += monthlyPayment;
    }

    // Only add year if there were payments
    if (annualPayment > 0) {
      schedule.push({
        period: year,
        paymentNumber: paymentNumber,
        monthlyPaymentSeK: annualPayment / 12,
        annualPaymentSeK: annualPayment,
        principalSeK: annualPrincipal / 12,
        annualPrincipalSeK: annualPrincipal,
        interestSeK: annualInterest / 12,
        annualInterestSeK: annualInterest,
        remainingBalanceSeK: portionStates.reduce((sum, p) => sum + p.remainingBalance, 0),
      });

      const totalRemainingBalance = portionStates.reduce((sum, p) => sum + p.remainingBalance, 0);
      if (totalRemainingBalance <= 0) {
        break;
      }
    }
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

export function calculateRequiredAmortizationRate(
  loanAmountSeK: number,
  housePriceSeK: number,
  annualIncomeSeK: number
): number {
  const ltv = housePriceSeK > 0 ? loanAmountSeK / housePriceSeK : 0;
  const debtToIncomeRatio = annualIncomeSeK > 0 ? loanAmountSeK / annualIncomeSeK : Infinity;

  const baseRate = ltv > 0.7 ? 0.02 : ltv >= 0.5 ? 0.01 : 0;
  const additionalRate = annualIncomeSeK > 0 && debtToIncomeRatio > 4.5 ? 0.01 : 0;

  return baseRate + additionalRate;
}

export function generateScenarios(
  housePriceSeK: number,
  loanAmountsSeK: number[],
  interestRates: number[],
  loanTermYears: number,
  annualIncomeSeK: number,
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
        housePriceSeK,
        annualIncomeSeK
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
