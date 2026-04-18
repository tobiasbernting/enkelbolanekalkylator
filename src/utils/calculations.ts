/**
 * Mortgage Calculation Utilities
 */

export interface LoanCalculation {
  loanAmountSeK: number;
  monthlyPaymentSeK: number;
  totalInterestSeK: number;
  totalCostSeK: number;
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
 * Generate amortization schedule (yearly view)
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
  downPaymentPercent: number;
  downPaymentSeK: number;
  interestRate: number;
  monthlyPaymentSeK: number;
  totalInterestSeK: number;
  totalCostSeK: number;
}

export function generateScenarios(
  housePriceSeK: number,
  downPaymentPercentages: number[],
  interestRates: number[],
  loanTermYears: number
): ScenarioResult[] {
  const scenarios: ScenarioResult[] = [];

  for (const downPaymentPercent of downPaymentPercentages) {
    for (const interestRate of interestRates) {
      const downPaymentSeK = (housePriceSeK * downPaymentPercent) / 100;
      const calc = calculateLoan(
        housePriceSeK,
        downPaymentSeK,
        interestRate,
        loanTermYears
      );

      scenarios.push({
        downPaymentPercent,
        downPaymentSeK,
        interestRate,
        monthlyPaymentSeK: calc.monthlyPaymentSeK,
        totalInterestSeK: calc.totalInterestSeK,
        totalCostSeK: calc.totalCostSeK,
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
